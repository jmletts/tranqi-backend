package com.tranki.backend.agent.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AgentTransactionJpaRepository extends JpaRepository<AgentTransactionJpaEntity, UUID> {
    List<AgentTransactionJpaEntity> findByAgentUserIdOrderByCreatedAtDesc(UUID agentUserId);
    List<AgentTransactionJpaEntity> findByAgentUserIdAndTypeOrderByCreatedAtDesc(UUID agentUserId, String type);
    List<AgentTransactionJpaEntity> findByAgentUserIdAndCreatedAtGreaterThanEqualOrderByCreatedAtDesc(
            UUID agentUserId, LocalDateTime since);
}
