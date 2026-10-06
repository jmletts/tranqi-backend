package com.tranki.backend.trip.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TripJpaRepository extends JpaRepository<TripJpaEntity, String> {
}
