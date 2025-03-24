--
-- PostgreSQL database dump
--

-- Dumped from database version 17.2
-- Dumped by pg_dump version 17.2

--
-- Name: timescaledb; Type: EXTENSION; Schema: -; Owner: -
--
DROP DATABASE IF EXISTS LivegridTesting;
CREATE DATABASE LivegridTesting;

CREATE EXTENSION IF NOT EXISTS timescaledb;
DROP TABLE IF EXISTS sensor_data;

DROP TABLE IF EXISTS sensors;
CREATE TABLE sensors (
    id integer PRIMARY KEY,
    name character varying(50),
    type character varying(40),
    location character varying(40),
    connected boolean,
    last_transmission TIMESTAMPTZ
);

INSERT INTO sensors(id, name, type, location, connected, last_transmission) VALUES
(1, 'WiFi Test Sensor 1', 'WiFi-P', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(2, 'Cellular Test Sensor 1','LTE-B', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(3, 'WiFi Test Sensor 2', 'WiFi-P', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(11, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(12, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(13, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(14, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(15, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(16, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(17, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04'),
(18, 'Python Simulated Sensor', 'PY-SIM', '(0, 0)', false, '2025-03-17 05:56:36.784-04');

CREATE TABLE sensor_data (
    time TIMESTAMPTZ NOT NULL,
    origin_id integer,
    phase1_data double precision,
    phase2_data double precision,
    phase3_data double precision,
    neutral_data double precision,
    FOREIGN KEY (origin_id) REFERENCES sensors(id)
);

SELECT create_hypertable('sensor_data', 'time');
