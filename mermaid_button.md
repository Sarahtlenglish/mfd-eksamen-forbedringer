flowchart TD
    BC[ButtonComponent.vue]
    
    subgraph Varianter
        P[Primary]:::primary
        S[Secondary]:::secondary
        T[Tertiary]:::tertiary
    end
    
    subgraph Props
        V[variant]:::prop
        SZ[size]:::prop
        D[disabled]:::prop
        IA[iconAfter]:::prop
        FW[fullWidth]:::prop
    end
    
    subgraph Slots
        DS[default: tekst]:::slot
        IS[icon: SVG]:::slot
    end
    
    BC --> Varianter
    BC --> Props
    BC --> Slots
    
    V --> Varianter
    
    classDef primary fill:#4285F4,color:white,stroke:none,rounded
    classDef secondary fill:white,color:#4285F4,stroke:#4285F4,rounded
    classDef tertiary fill:white,color:#4285F4,stroke:none,rounded
    
    classDef prop fill:#E1BEE7,color:#6A1B9A,stroke:none,rounded
    classDef slot fill:#BBDEFB,color:#0D47A1,stroke:none,rounded
    
    style BC fill:#9C27B0,color:white,stroke:none,rounded
    
    style Varianter fill:none,stroke:#DDD,stroke-dasharray: 5 5
    style Props fill:none,stroke:#DDD,stroke-dasharray: 5 5
    style Slots fill:none,stroke:#DDD,stroke-dasharray: 5 5