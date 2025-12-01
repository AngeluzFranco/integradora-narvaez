package utex.edu.mx.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "rooms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Room {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "building_id", nullable = false)
    private Building building;
    
    @Column(unique = true, nullable = false)
    private String number;
    
    @Column(nullable = false)
    private Integer floor;
    
    @Column(nullable = false)
    private String type;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CleaningStatus cleaningStatus;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OccupancyStatus occupancyStatus;
    
    private Integer beds;
    
    private Double price;
    
    @Column(name = "qr_code", unique = true)
    private String qrCode;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (cleaningStatus == null) {
            cleaningStatus = CleaningStatus.DIRTY;
        }
        if (occupancyStatus == null) {
            occupancyStatus = OccupancyStatus.AVAILABLE;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Estados de limpieza según requerimientos
    public enum CleaningStatus {
        CLEAN,      // Limpia - puede reservarse
        DIRTY,      // Sucia - necesita limpieza
        CLEANING    // En proceso de limpieza
    }
    
    // Estados de ocupación según requerimientos
    public enum OccupancyStatus {
        AVAILABLE,   // Disponible para reservar (solo si está limpia)
        OCCUPIED,    // Ocupada por huésped
        BLOCKED      // Bloqueada (mantenimiento, etc.)
    }
    
    // Método auxiliar para verificar si puede reservarse
    public boolean canBeReserved() {
        return cleaningStatus == CleaningStatus.CLEAN && 
               occupancyStatus == OccupancyStatus.AVAILABLE;
    }
}
