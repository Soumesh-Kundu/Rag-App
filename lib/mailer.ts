import {auth,gmail as googleGmail} from '@googleapis/gmail'
const credentialsObj={
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uris: [
            "http://localhost:3000"
        ]
    }
const {client_id,client_secret,redirect_uris}=credentialsObj
const Oauth2Client=new auth.OAuth2(client_id,client_secret,redirect_uris[0])

Oauth2Client.setCredentials({refresh_token:process.env.GMAIL_REFRESH_TOKEN})
const gmail=googleGmail({
    version:'v1',
    auth:Oauth2Client
})

type MailObject={
    to:string,
    from:string,
    subject:string,
    body:string
}

function makebody({to,from,subject,body}:MailObject){
    const str = [
        "Content-Type: text/html; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        body
    ].join("")
    return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_')
}



export  async function sendMail(mailBody:MailObject
){
    const raw=makebody(mailBody)
    
    const {data:{id}}=await gmail.users.messages.send({
        userId:"me",
        requestBody:{raw}
    })
    // console.log(id)
    return id
}