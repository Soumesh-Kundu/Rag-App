import { delay } from "../db/vectorDB"
import { randomUUID } from "crypto"
export type CleanData={
    metadata:string[],
    text:string
}
export type EmbeddingData={
    id:string,
    keywords:string[],
    textToEmbed:string
}
export function cleanData(data:CleanData[]):CleanData[] {
    const unwanted_patterns = [
        /\\n/g, /  —/g, /——————————/g,/-+/g,/---/g, /—————————/g, /—————/g,
        /\\u[\dA-Fa-f]{4}/g,/\.{4,}/g, /\uf075/g, /\uf0b7/g,/-+/g
    ]
    data = data.map((item) => {
        let text = item.text
        text = text.replaceAll(/(\w+)-\n(\w+)/gi, " ")
        for (let pattern of unwanted_patterns) {
            text = text.replaceAll(pattern, "")
        }
        text = text.replaceAll(/(\.\.+)/g, " ")
        text = text.replaceAll(/(\s+)/gi, " ")
        return { ...item, text }
    })
    return data
}
const MAX_TOKEN=78000
export  function extractKeyword(docs:{filename:string,data:CleanData[]} | undefined):EmbeddingData[] {
    if(!docs){
        return []
    }
    return docs.data.map(item => ({id:randomUUID(), keywords: [docs.filename,...item.metadata] , textToEmbed: item?.text}))
}

