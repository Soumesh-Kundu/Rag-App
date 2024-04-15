import {QdrantVectorStore} from 'llamaindex'
export function initVectorDB(){
    const client=new QdrantVectorStore({
        url:process.env.VECTOR_DB_URL,
        apiKey:process.env.QDRANT_API_KEY,
        collectionName:"llamaindex"
    })
    return client
}