let fontSizes:{[key:number]:number}={}
for(let page of data.Pages){
    for(let text of page.Texts){
        const size=text.R[0].TS[1]
        if(fontSizes[size]){
          fontSizes[size]++
        }else{
          fontSizes[size]=1
        }
    }
}
let maxFontSize:[string,number]=["0",0]
for(let [key,value] of Object.entries(fontSizes)){
  if(value>maxFontSize[1] ){
    maxFontSize[0]=key
    maxFontSize[1]=value
  }
}
console.log(fontSizes)
console.log(maxFontSize)
const cutOffFontsize=parseInt(maxFontSize[0])