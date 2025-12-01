package utex.edu.mx.server.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Incident {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;
    
    @ManyToOne
    @JoinColumn(name = "reported_by_id", nullable = false)
    private User reportedBy;
    
    @Column(nullable = false)
    private String category;
    
    @Column(nullable = false, length = 1000)
    private String description;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private IncidentStatus status;
    
    @Column(length = 1000)
    private String resolution;
    
    // Máximo 3 fotos en base64 (comprimidas)
    @Column(name = "photo1", columnDefinition = "LONGTEXT")
    private String photo1;
    
    @Column(name = "photo2", columnDefinition = "LONGTEXT")
    private String photo2;
    
    @Column(name = "photo3", columnDefinition = "LONGTEXT")
    private String photo3;
    
    @ManyToOne
    @JoinColumn(name = "resolved_by_id")
    private User resolvedBy;
    
    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "synced", nullable = false)
    private Boolean synced = false;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = IncidentStatus.PENDING;
        }
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    public enum IncidentStatus {
        PENDING, IN_PROGRESS, RESOLVED, CANCELLED
    }
}
