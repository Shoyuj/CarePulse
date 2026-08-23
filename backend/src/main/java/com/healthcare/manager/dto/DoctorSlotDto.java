package com.healthcare.manager.dto;

import java.time.LocalTime;

public class DoctorSlotDto {

    private LocalTime startTime;
    private LocalTime endTime;
    private boolean available;
    private boolean held;
    private boolean booked;
    private boolean heldByCurrentUser;
    private long holdRemainingSeconds;

    public DoctorSlotDto() {
    }

    public DoctorSlotDto(LocalTime startTime, LocalTime endTime, boolean available, boolean held, boolean booked) {
        this.startTime = startTime;
        this.endTime = endTime;
        this.available = available;
        this.held = held;
        this.booked = booked;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isHeld() {
        return held;
    }

    public void setHeld(boolean held) {
        this.held = held;
    }

    public boolean isBooked() {
        return booked;
    }

    public void setBooked(boolean booked) {
        this.booked = booked;
    }

    public boolean isHeldByCurrentUser() {
        return heldByCurrentUser;
    }

    public void setHeldByCurrentUser(boolean heldByCurrentUser) {
        this.heldByCurrentUser = heldByCurrentUser;
    }

    public long getHoldRemainingSeconds() {
        return holdRemainingSeconds;
    }

    public void setHoldRemainingSeconds(long holdRemainingSeconds) {
        this.holdRemainingSeconds = holdRemainingSeconds;
    }
}
