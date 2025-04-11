import { Sequelize } from "sequelize"

export const sensor_data_model = {
    time: {
        primaryKey: true,
        type: Sequelize.DATE
    },
    origin_id: {
        type: Sequelize.INTEGER
    },
    phase1_rms: {
        type: Sequelize.DOUBLE
    },
    phase2_rms: {
        type: Sequelize.DOUBLE
    },
    phase3_rms: {
        type: Sequelize.DOUBLE
    },
    neutral_rms: {
        type: Sequelize.DOUBLE
    }
}

export const sensors_model = {
    id: {
        primaryKey: true,
        type: Sequelize.INTEGER
    },
    name: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    location: {
        type: Sequelize.STRING
    },
    connected: {
        type: Sequelize.BOOLEAN
    },
    last_transmission: {
        type: Sequelize.DATE
    }
}

export const mn_sensor_data_model = {
    minute: {
        primaryKey: true,
        type: Sequelize.DATE
    },
    origin_id: {
        type: Sequelize.INTEGER
    },
    phase1_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase1_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase1_rms_min: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_min: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_min: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_avg: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_max: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_min: {
        type: Sequelize.DOUBLE
    },
}

export const hr_sensor_data_model = {
    hour: {
        primaryKey: true,
        type: Sequelize.DATE
    },
    origin_id: {
        type: Sequelize.INTEGER
    },
    phase1_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase1_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase1_rms_min: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_min: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_min: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_avg: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_max: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_min: {
        type: Sequelize.DOUBLE
    },
}

export const dy_sensor_data_model = {
    day: {
        primaryKey: true,
        type: Sequelize.DATE
    },
    origin_id: {
        type: Sequelize.INTEGER
    },
    phase1_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase1_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase1_rms_min: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase2_rms_min: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_avg: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_max: {
        type: Sequelize.DOUBLE
    },
    phase3_rms_min: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_avg: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_max: {
        type: Sequelize.DOUBLE
    },
    neutral_rms_min: {
        type: Sequelize.DOUBLE
    },
}

