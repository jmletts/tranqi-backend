package com.tranki.backend.trip.adapter.out.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripJpaRepository extends JpaRepository<TripJpaEntity, String> {
    List<TripJpaEntity> findByBusIdInOrderByLocalTimestampDesc(List<String> busIds);
    List<TripJpaEntity> findByLicensePlateIgnoreCaseOrderByLocalTimestampDesc(String licensePlate);
}
