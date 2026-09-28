package com.tranki.backend.trip.adapter.out.persistence;

import com.tranki.backend.shared.domain.Money;
import com.tranki.backend.trip.domain.Trip;
import com.tranki.backend.trip.domain.TripRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class TripPersistenceAdapter implements TripRepository {

    private final TripJpaRepository repository;

    public TripPersistenceAdapter(TripJpaRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Trip> findById(String tripId) {
        return repository.findById(tripId).map(entity -> new Trip(
                entity.getTripId(),
                entity.getCardId(),
                entity.getAccountId(),
                new Money(entity.getFare()),
                entity.getLocalTimestamp(),
                entity.getProcessingStatus(),
                entity.isRequiresDebtReview()
        ));
    }

    @Override
    public void save(Trip trip) {
        TripJpaEntity entity = new TripJpaEntity(
                trip.getTripId(),
                trip.getCardId(),
                trip.getAccountId(),
                trip.getFare().amount(),
                trip.getLocalTimestamp(),
                trip.getProcessingStatus(),
                trip.isRequiresDebtReview()
        );
        repository.save(entity);
    }
}
