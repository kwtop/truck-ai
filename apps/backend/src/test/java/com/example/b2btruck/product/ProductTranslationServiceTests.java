package com.example.b2btruck.product;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class ProductTranslationServiceTests {

    private ProductRepository productRepository;
    private ProductTranslationRepository translationRepository;
    private ProductTranslationService translationService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        productRepository = Mockito.mock(ProductRepository.class);
        translationRepository = Mockito.mock(ProductTranslationRepository.class);
        objectMapper = new ObjectMapper();
        translationService = new ProductTranslationService(productRepository, translationRepository, objectMapper);
    }

    @Test
    void upsertsProductTranslationForLocale() throws Exception {
        Product product = product();
        ProductTranslation saved = translation("es-MX", "Camion cisterna 10000L");
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        Mockito.when(translationRepository.upsert(Mockito.any())).thenReturn(saved);

        ProductTranslationResponse response = translationService.upsert(
                1L,
                " es-MX ",
                new ProductTranslationRequest(
                        " Camion cisterna 10000L ",
                        "Resumen",
                        "Descripcion",
                        "Combustible",
                        objectMapper.readTree("{\"tank_capacity\":\"10000 L\"}"),
                        "Titulo SEO",
                        "Descripcion SEO",
                        "camion,cisterna",
                        "https://example.com/es-MX/products/camion-cisterna-10000l",
                        "OG titulo",
                        "OG descripcion",
                        "https://example.com/og.jpg"
                )
        );

        assertThat(response.locale()).isEqualTo("es-MX");
        assertThat(response.name()).isEqualTo("Camion cisterna 10000L");
        assertThat(response.localizedSpecs().path("tank_capacity").asText()).isEqualTo("10000 L");
        assertThat(response.fallback()).isFalse();
        Mockito.verify(translationRepository).upsert(Mockito.argThat(command ->
                command.productId().equals(1L)
                        && command.locale().equals("es-MX")
                        && command.name().equals("Camion cisterna 10000L")
                        && command.localizedSpecs().contains("tank_capacity")
        ));
    }

    @Test
    void returnsDefaultProductContentWhenLocaleIsMissing() {
        Product product = product();
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(product));
        Mockito.when(translationRepository.findByProductIdAndLocale(1L, "fr-DZ")).thenReturn(Optional.empty());

        ProductTranslationResponse response = translationService.get(1L, "fr-DZ");

        assertThat(response.id()).isNull();
        assertThat(response.locale()).isEqualTo("fr-DZ");
        assertThat(response.name()).isEqualTo("10,000L Fuel Tank Truck");
        assertThat(response.summary()).isEqualTo("Road fuel delivery truck");
        assertThat(response.seoTitle()).isEqualTo("Fuel Tank Truck");
        assertThat(response.seoDescription()).isEqualTo("Fuel tank truck for export");
        assertThat(response.fallback()).isTrue();
    }

    @Test
    void listsSavedTranslationsWithoutFallbackRows() {
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(product()));
        Mockito.when(translationRepository.findByProductId(1L)).thenReturn(List.of(
                translation("es-MX", "Camion cisterna 10000L"),
                translation("fr-DZ", "Camion-citerne 10000L")
        ));

        List<ProductTranslationResponse> responses = translationService.list(1L);

        assertThat(responses).extracting(ProductTranslationResponse::locale).containsExactly("es-MX", "fr-DZ");
        assertThat(responses).allMatch(response -> !response.fallback());
    }

    @Test
    void rejectsMissingNameAndInvalidLocalizedSpecs() throws Exception {
        Mockito.when(productRepository.findById(1L)).thenReturn(Optional.of(product()));

        assertThatThrownBy(() -> translationService.upsert(
                1L,
                "es-MX",
                new ProductTranslationRequest(" ", null, null, null, null, null, null, null, null, null, null, null)
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name is required");

        assertThatThrownBy(() -> translationService.upsert(
                1L,
                "es-MX",
                new ProductTranslationRequest("Nombre", null, null, null, objectMapper.readTree("[1]"), null, null, null, null, null, null, null)
        )).isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("localizedSpecs must be a JSON object");
    }

    @Test
    void rejectsUnknownProduct() {
        Mockito.when(productRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> translationService.get(99L, "es-MX"))
                .isInstanceOf(ProductNotFoundException.class);
    }

    private Product product() {
        return new Product(
                1L,
                10L,
                "SKU-10000L",
                "fuel-tank-truck-10000l",
                "10,000L Fuel Tank Truck",
                "Road fuel delivery truck",
                "PUBLISHED",
                "{\"tank_capacity\":10000}",
                "{\"title\":\"Fuel Tank Truck\",\"description\":\"Fuel tank truck for export\"}",
                "{}",
                true,
                true,
                1,
                OffsetDateTime.parse("2026-05-01T00:00:00Z"),
                1L,
                1L,
                OffsetDateTime.parse("2026-05-01T00:00:00Z"),
                OffsetDateTime.parse("2026-05-02T00:00:00Z")
        );
    }

    private ProductTranslation translation(String locale, String name) {
        return new ProductTranslation(
                100L,
                1L,
                locale,
                name,
                "Summary",
                "Description",
                "Applications",
                "{\"tank_capacity\":\"10000 L\"}",
                "SEO title",
                "SEO description",
                "keywords",
                "https://example.com/" + locale,
                "OG title",
                "OG description",
                "https://example.com/og.jpg",
                OffsetDateTime.parse("2026-05-01T00:00:00Z"),
                OffsetDateTime.parse("2026-05-02T00:00:00Z")
        );
    }
}
