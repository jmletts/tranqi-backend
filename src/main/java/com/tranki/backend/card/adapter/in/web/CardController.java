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

    public CardController(IssueCardUseCase issueCardUseCase, com.tranki.backend.card.application.ChangeFareCategoryUseCase changeFareCategoryUseCase) {
        this.issueCardUseCase = issueCardUseCase;
        this.changeFareCategoryUseCase = changeFareCategoryUseCase;
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
}
