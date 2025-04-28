flowchart TD
    subgraph Main
    CC[CalendarComponent.vue]
    end
    
    subgraph Header
    CH[CalendarHeader.vue]
    MD[Month/Year Dropdown]
    end
    
    subgraph Grid
    WDH[WeekDaysHeader.vue]
    CG[CalendarGrid.vue]
    end
    
    subgraph Days
    CD[CalendarDay.vue]
    CDT[CalendarDayTask.vue]
    end
    
    subgraph Detail
    CDC[CalendarDetailContent]
    TD[Task Details]
    SB[Status Banners]
    AB[Action Buttons]
    end
    
    CC --> CH
    CC --> WDH
    CC --> CG
    CH --> MD
    CG --> CD
    CD --> CDT
    CD --> CDC
    CDC --> TD
    CDC --> SB
    CDC --> AB
    
    %% Simplified data flow
    CC -. "data" .-> CG
    CG -. "data" .-> CD
    
    style Main fill:#f9f
    style Header fill:#bbf
    style Grid fill:#bbf
    style Days fill:#ddf
    style Detail fill:#ddf