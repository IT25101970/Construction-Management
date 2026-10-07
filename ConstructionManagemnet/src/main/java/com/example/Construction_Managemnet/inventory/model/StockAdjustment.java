package com.example.Construction_Managemnet.inventory.model;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record StockAdjustment(@NotNull @Positive Double quantity, @NotNull Type transactionType,
                              String siteName, String issuedTo, String remarks) {
    public enum Type { STOCK_IN, STOCK_OUT }
}
