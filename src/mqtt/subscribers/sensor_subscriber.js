"use strict";

const {
  saveRawSensorLog,
  updateDeviceLastSeen,
  findDeviceById,
} = require("../../repositories/sensor_repository");

const {
  setLatestSensorData,
  shouldSaveToDatabase,
} = require("../../repositories/sensor_redis_repository");

const { broadcastToDevice } = require("../../sse/sse_manager");

const SENSOR_TOPIC = "suburin/devices/+/telemetry";

function registerSensorSubscriber(mqttClient) {
  mqttClient.subscribe(SENSOR_TOPIC, { qos: 1 }, (err) => {
    if (err) {
      console.error(
        `[MQTT Subscriber] ❌ Gagal subscribe ke topic "${SENSOR_TOPIC}":`,
        err.message
      );
      return;
    }
    console.log(
      `[MQTT Subscriber] ✅ Subscribe berhasil ke topic: "${SENSOR_TOPIC}"`
    );
  });

  mqttClient.on("message", async (topic, payload) => {
    if (!isSensorTopic(topic)) return;

    const deviceId = extractDeviceId(topic);
    if (!deviceId) {
      console.warn(
        `[MQTT Subscriber] ⚠️  Tidak bisa ekstrak deviceId dari topic: ${topic}`
      );
      return;
    }

    let data;
    try {
      data = JSON.parse(payload.toString());
    } catch {
      console.error(
        `[MQTT Subscriber] ❌ Payload bukan JSON valid dari device "${deviceId}":`,
        payload.toString()
      );
      return;
    }

    const ph = data.ph;
    const moisture = data.moisture !== undefined ? data.moisture : data.soil_moisture;

    if (!isValidSensorValue(ph, "ph") || !isValidSensorValue(moisture, "moisture")) {
      console.warn(
        `[MQTT Subscriber] ⚠️  Nilai sensor tidak valid dari device "${deviceId}":`,
        data
      );
      return;
    }

    console.log(
      `[MQTT Subscriber] 📥 Data diterima | Device: ${deviceId} | pH: ${ph} | Moisture: ${moisture}%`
    );

    try {
      await setLatestSensorData(deviceId, ph, moisture);

      const sensorPayload = {
        deviceId,
        ph,
        moisture,
        timestamp: new Date().toISOString(),
      };
      broadcastToDevice(deviceId, sensorPayload);

      const device = await findDeviceById(deviceId);
      if (!device) {
        console.warn(
          `[MQTT Subscriber] ⚠️  Device "${deviceId}" tidak ditemukan di database. Data Redis disimpan, Postgres diabaikan.`
        );
        return;
      }

      const allowWrite = await shouldSaveToDatabase(deviceId);
      if (allowWrite) {
        await saveRawSensorLog(deviceId, ph, moisture);
        await updateDeviceLastSeen(deviceId);
        console.log(
          `[MQTT Subscriber] 💾 Data sensor disimpan ke Postgres | Device: ${deviceId}`
        );
      }
    } catch (err) {
      console.error(
        `[MQTT Subscriber] ❌ Error saat memproses data dari device "${deviceId}":`,
        err.message
      );
    }
  });
}

function isSensorTopic(topic) {
  return /^suburin\/devices\/.+\/telemetry$/.test(topic);
}

function extractDeviceId(topic) {
  const parts = topic.split("/");
  return parts.length === 4 ? parts[2] : null;
}

function isValidSensorValue(value, fieldName) {
  if (typeof value !== "number" || isNaN(value)) {
    console.warn(
      `[MQTT Subscriber] Nilai "${fieldName}" tidak valid: ${value}`
    );
    return false;
  }
  if (fieldName === "ph" && (value < 0 || value > 14)) {
    console.warn(
      `[MQTT Subscriber] Nilai "${fieldName}" di luar rentang yang diizinkan (0-14): ${value}`
    );
    return false;
  }
  if (fieldName === "moisture" && (value < 0 || value > 100)) {
    console.warn(
      `[MQTT Subscriber] Nilai "${fieldName}" di luar rentang yang diizinkan (0-100): ${value}`
    );
    return false;
  }
  return true;
}

module.exports = { registerSensorSubscriber, SENSOR_TOPIC };
