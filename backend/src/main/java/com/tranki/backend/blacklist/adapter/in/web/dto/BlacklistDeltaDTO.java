package com.tranki.backend.blacklist.adapter.in.web.dto;

import java.util.List;

public record BlacklistDeltaDTO(
        List<String> add,
        List<String> remove
) {}
