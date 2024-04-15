import { writeFile } from "fs/promises";
import {
    Document,
    KeywordExtractor,
    OpenAI,
    SimpleNodeParser,
} from "llamaindex";

export function cleanData(data) {
    // data = data.map(item => item.text)
    const unwanted_patterns = [
        /\\n/g, /  —/g, /——————————/g, /---/g, /—————————/g, /—————/g,
        /\\u[\dA-Fa-f]{4}/g, /\uf075/g, /\uf0b7/g
    ]
    data = data.map((item) => {
        let text = item.text
        text = text.replaceAll(/(\w+)-\n(\w+)/gi, /\1\2/)
        for (let pattern of unwanted_patterns) {
            text = text.replaceAll(pattern, "")
        }
        text = text.replaceAll(/(\.\.+)/g, " ")
        text = text.replaceAll(/(\s+)/gi, " ")
        return { ...item, text }
    })
    return data
}
export async function getSememnticDocs(documents) {
    try {
        const textData = documents
        const res = await fetch(process.env.NEXT_BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ data: textData }),
            cache: "no-cache"
        })
        if (!res.ok) {
            console.log("failed", res.status, res.statusText)
            return []
        }
        const data = await res.json()
        // console.log(data)
        const parsedDocuments = data.data.map((item) => new Document({ text: item }))
        return parsedDocuments
    } catch (error) {
        console.log(error)
    }
}

export async function extractKeyword(documents) {
    const openaiLLM = new OpenAI({ model: process.env.MODEL, temperature: 0, apiKey: process.env.OPENAI_API_KEY });
    documents = cleanData(documents)
    documents = await getSememnticDocs(documents)
    const nodeParser = new SimpleNodeParser({});

    const nodes = nodeParser.getNodesFromDocuments(documents);


    const keywordExtractor = new KeywordExtractor({
        llm: openaiLLM,
        keywords: 10,
    });

    const data = await keywordExtractor.processNodes(nodes);
    return data.map(item => new Document({ id_: item?.id_, metadata: { keywords: item?.metadata?.excerptKeywords.split(', ') }, text: item?.text }))
}
// await extractKeyword()