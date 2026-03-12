package com.example.KrushiMitra;

import com.example.KrushiMitra.repository.SchemeRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class SchemeCountRunner implements CommandLineRunner {
    private final SchemeRepository schemeRepository;

    public SchemeCountRunner(SchemeRepository schemeRepository) {
        this.schemeRepository = schemeRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        long count = schemeRepository.count();
        log.info("============== TOTAL SCHEMES LOADED: {} ==============", count);
    }
}
