package com.tranki.backend.blacklist.application.port.out;

public interface BlacklistSignatureGeneratorPort {
    /**
     * Genera una firma ECDSA en Base64 para un payload dado usando la Llave Privada Maestra.
     * @param payload El JSON o texto a firmar.
     * @return La firma en formato Base64.
     */
    String generateSignature(String payload);
}
