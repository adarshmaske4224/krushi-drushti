package com.example.KrushiMitra.repository;


import com.example.KrushiMitra.entity.Scheme;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SchemeRepository extends JpaRepository<Scheme, Long> {
    List<Scheme> findByIsActiveTrue();
}