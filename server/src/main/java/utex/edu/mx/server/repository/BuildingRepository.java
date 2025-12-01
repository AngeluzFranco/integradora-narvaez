package utex.edu.mx.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import utex.edu.mx.server.model.Building;
import utex.edu.mx.server.model.Hotel;

import java.util.List;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Long> {
    List<Building> findByHotel(Hotel hotel);
    List<Building> findByHotelId(Long hotelId);
}
