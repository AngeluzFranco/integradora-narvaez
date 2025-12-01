package utex.edu.mx.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utex.edu.mx.server.model.Incident;
import utex.edu.mx.server.model.Incident.IncidentStatus;
import utex.edu.mx.server.model.Room;
import utex.edu.mx.server.model.User;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    List<Incident> findByStatus(IncidentStatus status);
    List<Incident> findByRoomId(Long roomId);
    List<Incident> findByReportedByOrderByCreatedAtDesc(User reportedBy);
    List<Incident> findByRoomOrderByCreatedAtDesc(Room room);
    List<Incident> findBySyncedFalse();
}
