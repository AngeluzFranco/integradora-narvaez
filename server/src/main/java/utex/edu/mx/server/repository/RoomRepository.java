package utex.edu.mx.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utex.edu.mx.server.model.Building;
import utex.edu.mx.server.model.Room;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByNumber(String number);
    Optional<Room> findByQrCode(String qrCode);
    boolean existsByNumber(String number);
    boolean existsByQrCode(String qrCode);
    List<Room> findByBuilding(Building building);
    List<Room> findByBuildingId(Long buildingId);
    List<Room> findByCleaningStatus(Room.CleaningStatus cleaningStatus);
    List<Room> findByOccupancyStatus(Room.OccupancyStatus occupancyStatus);
}
