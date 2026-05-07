// src/services/upload.js
// S3 File Upload Service

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class UploadService {
    constructor() {
        this.s3 = new AWS.S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
        });
        this.bucket = process.env.AWS_S3_BUCKET;
    }

    async uploadFile(file, folder = 'uploads') {
        const key = `${folder}/${uuidv4()}-${file.originalname}`;
        
        const params = {
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
            ACL: 'public-read'
        };

        try {
            const result = await this.s3.upload(params).promise();
            return {
                url: result.Location,
                key: result.Key,
                bucket: result.Bucket
            };
        } catch (error) {
            console.error('S3 upload error:', error);
            throw error;
        }
    }

    async deleteFile(key) {
        const params = {
            Bucket: this.bucket,
            Key: key
        };

        try {
            await this.s3.deleteObject(params).promise();
            return true;
        } catch (error) {
            console.error('S3 delete error:', error);
            throw error;
        }
    }

    async getSignedUrl(key, expiresIn = 3600) {
        const params = {
            Bucket: this.bucket,
            Key: key,
            Expires: expiresIn
        };

        try {
            const url = await this.s3.getSignedUrl('getObject', params);
            return url;
        } catch (error) {
            console.error('S3 signed URL error:', error);
            throw error;
        }
    }
}

module.exports = new UploadService();
