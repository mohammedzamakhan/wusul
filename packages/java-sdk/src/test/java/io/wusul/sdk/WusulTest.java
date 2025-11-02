package io.wusul.sdk;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Basic tests for the Wusul SDK.
 */
public class WusulTest {

    @Test
    public void testClientCreation() {
        Wusul client = new Wusul("test-account-id", "test-shared-secret");
        assertNotNull(client);
        assertNotNull(client.accessPasses);
        assertNotNull(client.console);
    }

    @Test
    public void testClientCreationWithNullAccountId() {
        assertThrows(IllegalArgumentException.class, () -> {
            new Wusul(null, "test-shared-secret");
        });
    }

    @Test
    public void testClientCreationWithNullSharedSecret() {
        assertThrows(IllegalArgumentException.class, () -> {
            new Wusul("test-account-id", null);
        });
    }

    @Test
    public void testClientCreationWithEmptyAccountId() {
        assertThrows(IllegalArgumentException.class, () -> {
            new Wusul("", "test-shared-secret");
        });
    }

    @Test
    public void testClientCreationWithEmptySharedSecret() {
        assertThrows(IllegalArgumentException.class, () -> {
            new Wusul("test-account-id", "");
        });
    }

    @Test
    public void testClientCreationWithCustomConfig() {
        Wusul client = new Wusul(
            "test-account-id",
            "test-shared-secret",
            "https://custom-api.wusul.io",
            60000
        );
        assertNotNull(client);
    }
}
