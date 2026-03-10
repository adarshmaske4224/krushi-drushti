package com.example.KrushiMitra;

import com.example.KrushiMitra.repository.SchemeRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SchemeCountRunner implements CommandLineRunner {
    private final SchemeRepository schemeRepository;

    public SchemeCountRunner(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        System.out.println("============== TOTAL SCHEMES LOADED: " + schemeRepository.count() + " ==============");
    }
}
