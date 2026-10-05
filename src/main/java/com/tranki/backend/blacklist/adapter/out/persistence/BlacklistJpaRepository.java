package com.tranki.backend.blacklist.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BlacklistJpaRepository extends JpaRepository<BlacklistJpaEntity, String> {
    List<BlacklistJpaEntity> findByVersionGreaterThan(long version);
}
