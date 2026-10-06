package com.tranki.backend.trip.domain;

import java.util.Optional;

public interface TripRepository {
    Optional<Trip> findById(String tripId);
    void save(Trip trip);
}
