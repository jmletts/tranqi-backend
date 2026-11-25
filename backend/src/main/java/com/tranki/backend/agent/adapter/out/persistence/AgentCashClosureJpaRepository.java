package com.tranki.backend.agent.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface AgentCashClosureJpaRepository extends JpaRepository<AgentCashClosureJpaEntity, UUID> {
    List<AgentCashClosureJpaEntity> findTop10ByAgentUserIdOrderByClosedAtDesc(UUID agentUserId);
}
