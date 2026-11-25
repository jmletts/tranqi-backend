package com.tranki.backend.card.adapter.in.web;

import com.tranki.backend.card.adapter.in.web.dto.ChangeFareCategoryRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardResponseDTO;
import com.tranki.backend.card.adapter.in.web.dto.LinkCardRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.LinkMyCardRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.TravelerCardDTO;
import com.tranki.backend.card.application.ChangeFareCategoryUseCase;
import com.tranki.backend.card.application.GetUserCardsUseCase;
import com.tranki.backend.card.application.IssueCardUseCase;
import com.tranki.backend.card.application.LinkCardToUserUseCase;
import com.tranki.backend.card.application.ReportCardLostUseCase;
import com.tranki.backend.iam.domain.User;
import com.tranki.backend.iam.infrastructure.security.AuthenticatedUserResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cards")
public class CardController {

    private final IssueCardUseCase issueCardUseCase;
    private final ChangeFareCategoryUseCase changeFareCategoryUseCase;
    private final LinkCardToUserUseCase linkCardToUserUseCase;
    private final GetUserCardsUseCase getUserCardsUseCase;
    private final ReportCardLostUseCase reportCardLostUseCase;
    private final AuthenticatedUserResolver authenticatedUserResolver;

    public CardController(
            IssueCardUseCase issueCardUseCase,
            ChangeFareCategoryUseCase changeFareCategoryUseCase,
            LinkCardToUserUseCase linkCardToUserUseCase,
            GetUserCardsUseCase getUserCardsUseCase,
            ReportCardLostUseCase reportCardLostUseCase,
            AuthenticatedUserResolver authenticatedUserResolver) {
        this.issueCardUseCase = issueCardUseCase;
        this.changeFareCategoryUseCase = changeFareCategoryUseCase;
        this.linkCardToUserUseCase = linkCardToUserUseCase;
        this.getUserCardsUseCase = getUserCardsUseCase;
        this.reportCardLostUseCase = reportCardLostUseCase;
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @GetMapping("/me")
    public ResponseEntity<List<TravelerCardDTO>> getMyCards() {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        return ResponseEntity.ok(getUserCardsUseCase.execute(currentUser.getId()));
    }

    @PostMapping("/me/link")
    public ResponseEntity<Void> linkMyCard(@RequestBody LinkMyCardRequestDTO request) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        linkCardToUserUseCase.executeForAuthenticatedUser(
                currentUser.getId(),
                request.cardIdentifier(),
                request.securityCode(),
                request.alias()
        );
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cardId}/report-lost")
    public ResponseEntity<Void> reportLost(@PathVariable String cardId) {
        User currentUser = authenticatedUserResolver.requireAuthenticatedUser();
        reportCardLostUseCase.execute(currentUser.getId(), cardId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/issue")
    public ResponseEntity<IssueCardResponseDTO> issueCard(@RequestBody IssueCardRequestDTO request) {
        IssueCardResponseDTO response = issueCardUseCase.execute(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/category")
    public ResponseEntity<Void> changeCategory(@RequestBody ChangeFareCategoryRequestDTO request) {
        changeFareCategoryUseCase.execute(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cardId}/link")
    public ResponseEntity<Void> linkCard(@PathVariable String cardId, @RequestBody LinkCardRequestDTO request) {
        LinkCardRequestDTO effectiveRequest = (request.cardId() == null || request.cardId().isBlank())
                ? new LinkCardRequestDTO(cardId, request.userId(), request.securityCode())
                : request;
        linkCardToUserUseCase.execute(effectiveRequest);
        return ResponseEntity.ok().build();
    }
}
