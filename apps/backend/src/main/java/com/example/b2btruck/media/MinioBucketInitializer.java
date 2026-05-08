package com.example.b2btruck.media;

import com.example.b2btruck.media.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class MinioBucketInitializer implements ApplicationRunner {

    private final MinioClient minioClient;
    private final MinioProperties properties;

    public MinioBucketInitializer(MinioClient minioClient, MinioProperties properties) {
        this.minioClient = minioClient;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (properties.ensureBucket()) {
            ensureBucket();
        }
    }

    public void ensureBucket() {
        try {
            boolean exists = minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(properties.bucket())
                    .build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(properties.bucket())
                        .build());
            }
        } catch (Exception exception) {
            throw new IllegalStateException("Failed to ensure MinIO bucket " + properties.bucket(), exception);
        }
    }
}
