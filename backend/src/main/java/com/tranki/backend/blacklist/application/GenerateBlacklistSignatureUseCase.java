package com.tranki.backend.blacklist.application;

import com.tranki.backend.blacklist.application.port.out.BlacklistSignatureGeneratorPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.Signature;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;

@Service
public class GenerateBlacklistSignatureUseCase implements BlacklistSignatureGeneratorPort {

    private final String serverPrivateKeyBase64;

    public GenerateBlacklistSignatureUseCase(
            @Value("${tranki.security.server-private-key:}") String serverPrivateKeyBase64) {
        this.serverPrivateKeyBase64 = serverPrivateKeyBase64;
    }

    @Override
    public String generateSignature(String payload) {
        if (serverPrivateKeyBase64 == null || serverPrivateKeyBase64.isBlank()) {
            throw new IllegalStateException("La llave privada del servidor no está configurada.");
        }

        try {
            // Decodificar la llave privada PKCS#8 en formato Base64
            byte[] privateKeyBytes = Base64.getDecoder().decode(serverPrivateKeyBase64);
            PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(privateKeyBytes);
            KeyFactory keyFactory = KeyFactory.getInstance("EC");
            PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

            // Firmar el payload usando ECDSA
            Signature ecdsaSign = Signature.getInstance("SHA256withECDSA");
            ecdsaSign.initSign(privateKey);
            ecdsaSign.update(payload.getBytes("UTF-8"));

            // Generar la firma matemática
            byte[] signatureBytes = ecdsaSign.sign();
            return Base64.getEncoder().encodeToString(signatureBytes);

        } catch (Exception e) {
            throw new RuntimeException("Error criptográfico al generar la firma de la lista negra", e);
        }
    }
}
