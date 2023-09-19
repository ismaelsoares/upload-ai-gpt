import { FastifyInstance } from "fastify";
import { fastifyMultipart } from '@fastify/multipart';
import { prisma } from "../lib/prisma";
import path from 'node:path';
import fs, { createWriteStream } from 'node:fs';
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { randomUUID } from "node:crypto";

const pump = promisify(pipeline);
export async function uploadVideoRoute(app: FastifyInstance){
    app.register(fastifyMultipart, {
        limits: {
            fileSize: 1_048_576 * 25, // 25mb
        }
    });
    app.post('/videos', async (request, reply) => {
        const data = await request.file()

        if(!data){
            return reply.status(400).send({ error: 'Missing file input.'})
        }

        const extension = path.extname(data.filename)
        //A conversão será feita diretamente no navegador para mp3, e o servidor usará para transcrição
        if(extension !== '.mp3'){
            return reply.status(400).send({ error: 'Invalid input type, please upload a MP3.'})            
        }
        //evita que arquivos contenham o mesmo nome
        const fileBaseName = path.basename(data.filename, extension)
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
        
        //aonde irá ficar salvo o arquivo
        const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

        //aguardar com que a pipeline recebendo o upload do arquivo e escrevendo o arquivo (recebe ao poucos e escreve aos poucos)
        await pump(data.file, fs.createWriteStream(uploadDestination))
        
        //depois do upload do vídeo, criar um registra de criação do arquivo gerado
        const video = await prisma.video.create({
            data:{
                name: data.filename,
                path: uploadDestination,
            }
        })

        return {
            video,
        }
    })
    
}