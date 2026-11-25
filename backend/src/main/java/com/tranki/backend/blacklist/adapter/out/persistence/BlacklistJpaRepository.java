package com.tranki.backend.blacklist.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BlacklistJpaRepository extends JpaRepository<BlacklistJpaEntity, String> {
    List<BlacklistJpaEntity> findByVersionGreaterThan(long version);

    @Query("SELECT COALESCE(MAX(b.version), 0) FROM BlacklistJpaEntity b")
    long findMaxVersion();
}
