package utex.edu.mx.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utex.edu.mx.server.model.Assignment;
import utex.edu.mx.server.model.User;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByMaid(User maid);
    List<Assignment> findByAssignmentDate(LocalDate date);
    List<Assignment> findByMaidAndAssignmentDate(User maid, LocalDate date);
}
