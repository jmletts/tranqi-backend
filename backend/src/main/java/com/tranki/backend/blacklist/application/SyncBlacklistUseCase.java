package com.tranki.backend.blacklist.application;

import com.tranki.backend.blacklist.adapter.in.web.dto.BlacklistCardDTO;
import com.tranki.backend.blacklist.adapter.in.web.dto.BlacklistDeltaDTO;
import com.tranki.backend.blacklist.adapter.in.web.dto.BlacklistSyncResponseDTO;
import com.tranki.backend.blacklist.domain.BlacklistEntry;
import com.tranki.backend.blacklist.domain.BlacklistRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class SyncBlacklistUseCase {

    private final BlacklistRepository repository;

    public SyncBlacklistUseCase(BlacklistRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = "blacklist", key = "#localVersion")
    public BlacklistSyncResponseDTO getUpdatesSince(long localVersion) {
        long currentVersion = repository.getCurrentGlobalVersion();
        
        if (localVersion == currentVersion) {
            return new BlacklistSyncResponseDTO(currentVersion, false, null, null, new BlacklistDeltaDTO(List.of(), List.of()));
        }

        if (localVersion == 0 || (currentVersion - localVersion) > 1000) {
            List<BlacklistEntry> allEntries = repository.findAll();
            
            List<BlacklistCardDTO> cards = new ArrayList<>();
            for (BlacklistEntry entry : allEntries) {
                if (entry.isActive()) {
                    cards.add(new BlacklistCardDTO(entry.getCardId(), entry.getReason().name()));
                }
            }
            
            byte[] mockBinary = new byte[]{0x01, 0x02, 0x03, 0x04};
            return new BlacklistSyncResponseDTO(currentVersion, true, mockBinary, cards, null);
        }

        List<BlacklistEntry> updates = repository.findSinceVersion(localVersion);
        List<String> add = new ArrayList<>();
        List<String> remove = new ArrayList<>();
        
        for (BlacklistEntry entry : updates) {
            if (entry.isActive()) {
                add.add(entry.getCardId());
            } else {
                remove.add(entry.getCardId());
            }
        }
        
        return new BlacklistSyncResponseDTO(currentVersion, false, null, null, new BlacklistDeltaDTO(add, remove));
    }
}
