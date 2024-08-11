require ('dotenv').config()
const express = require ('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const cloudinary = require('cloudinary').v2


cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret:process.env.API_SECRET
})

const storage = multer.diskStorage({
    destination: (res, file, cb)=>{
        cb(null, 'uploads/')
    },
    filename:(req, file, cb)=>{
        cb(null, Date.now()+ '-'+ file.originalname)
    }
})

const upload = multer({storage})


const app = express()
const port = 3000

app.get('/', (req,res)=>{
    const caminhoAbsoluto = path.join(__dirname, './index.html'); // Substitua 'public' pelo diretório correto
  res.sendFile(caminhoAbsoluto);
})

app.post('/upload',upload.single('image'),async(req,res)=>{
    let filePath
    try{
        if(!req.file){
            return res.status(400).json({error: 'Nenhum arquivo encontrado'})
        }
        filePath = req.file.path
        const result = await cloudinary.uploader.upload(filePath,{resource_type:'auto'})
        //fs.unlinkSync(filePath)
        res.redirect(`/imagens?url=${encodeURIComponent(result.secure_url)}`);
    }catch(error){
        console.log(error)
        if (filePath) {
           // fs.unlinkSync(filePath); 
          }
        res.status(500).json({error:"erro ao fazer o upload da imagem"})
    }
})
app.get('/imagens', (req, res) => {
    const imageUrl = req.query.url;
    if (imageUrl) {
        res.send(`
            <h1>Imagem enviada com sucesso!</h1>
            <img src="${imageUrl}" alt="Imagem" style="width: 250px;" />
            <br/>
            <a href="/">Voltar</a>
        `);
    } else {
        res.send('<h1>Nenhuma imagem encontrada</h1><a href="/">Voltar</a>');
    }
});





app.listen(port, ()=>{
    console.log(`Servidor rodando em http://localhost:${port}`)
})