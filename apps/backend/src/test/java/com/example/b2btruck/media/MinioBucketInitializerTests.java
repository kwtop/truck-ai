package com.example.b2btruck.media;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.example.b2btruck.media.config.MinioProperties;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class MinioBucketInitializerTests {

    @Mock
    private MinioClient minioClient;

    @Test
    void createsBucketWhenMissing() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);
        MinioBucketInitializer initializer = new MinioBucketInitializer(
                minioClient,
                properties(true)
        );

        initializer.ensureBucket();

        verify(minioClient).bucketExists(argThat(args -> "b2btruck-media".equals(args.bucket())));
        verify(minioClient).makeBucket(argThat(args -> "b2btruck-media".equals(args.bucket())));
    }

    @Test
    void keepsExistingBucket() throws Exception {
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(true);
        MinioBucketInitializer initializer = new MinioBucketInitializer(
                minioClient,
                properties(true)
        );

        initializer.ensureBucket();

        verify(minioClient).bucketExists(any(BucketExistsArgs.class));
        verify(minioClient, never()).makeBucket(any(MakeBucketArgs.class));
    }

    @Test
    void skipsStartupCheckWhenDisabled() {
        MinioBucketInitializer initializer = new MinioBucketInitializer(
                minioClient,
                properties(false)
        );

        initializer.run(null);

        verifyNoInteractions(minioClient);
    }

    private MinioProperties properties(boolean ensureBucket) {
        return new MinioProperties(
                "http://localhost:9000",
                "minioadmin",
                "minioadmin",
                "b2btruck-media",
                ensureBucket
        );
    }
}
