package com.tranki.backend.card.adapter.in.web;

import com.tranki.backend.card.adapter.in.web.dto.IssueCardRequestDTO;
import com.tranki.backend.card.adapter.in.web.dto.IssueCardResponseDTO;
import com.tranki.backend.card.application.IssueCardUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cards")
public class CardController {

    private final IssueCardUseCase issueCardUseCase;
    private final com.tranki.backend.card.application.ChangeFareCategoryUseCase changeFareCategoryUseCase;
    private final com.tranki.backend.card.application.LinkCardToUserUseCase linkCardToUserUseCase;

    public CardController(IssueCardUseCase issueCardUseCase, com.tranki.backend.card.application.ChangeFareCategoryUseCase changeFareCategoryUseCase, com.tranki.backend.card.application.LinkCardToUserUseCase linkCardToUserUseCase) {
        this.issueCardUseCase = issueCardUseCase;
        this.changeFareCategoryUseCase = changeFareCategoryUseCase;
        this.linkCardToUserUseCase = linkCardToUserUseCase;
    }

    @PostMapping("/issue")
    public ResponseEntity<IssueCardResponseDTO> issueCard(@RequestBody IssueCardRequestDTO request) {
        IssueCardResponseDTO response = issueCardUseCase.execute(request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/category")
    public ResponseEntity<Void> changeCategory(@RequestBody com.tranki.backend.card.adapter.in.web.dto.ChangeFareCategoryRequestDTO request) {
        changeFareCategoryUseCase.execute(request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{cardId}/link")
    public ResponseEntity<Void> linkCard(@PathVariable String cardId, @RequestBody com.tranki.backend.card.adapter.in.web.dto.LinkCardRequestDTO request) {
        // En el mundo real mapeariamos para asegurar que el cardId del path hace match
        linkCardToUserUseCase.execute(request);
        return ResponseEntity.ok().build();
    }
}
