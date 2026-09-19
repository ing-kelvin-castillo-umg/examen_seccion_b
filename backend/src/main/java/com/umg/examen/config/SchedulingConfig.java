package com.umg.examen.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/** Habilita tareas programadas (depuración de la blacklist de tokens). */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
