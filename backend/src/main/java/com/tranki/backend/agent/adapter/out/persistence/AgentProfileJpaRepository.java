package com.tranki.backend.agent.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface AgentProfileJpaRepository extends JpaRepository<AgentProfileJpaEntity, UUID> {
    boolean existsByAgentCode(String agentCode);
}
