import numpy as np
import matplotlib.pyplot as plt

# ----------------------------------------------------
# 1. Parameter Tanaman (Menggunakan Spesifikasi Bayam sebagai Referensi)
# ----------------------------------------------------
min_ph = 6.0
max_ph = 7.0

# ----------------------------------------------------
# 2. Definisi Fungsi Keanggotaan pH Parametrik (x1)
# ----------------------------------------------------
def mu_sangat_asam(x):
    if x <= min_ph - 1.5:
        return 1.0
    elif x <= min_ph - 0.5:
        return (min_ph - 0.5 - x) / 1.0
    else:
        return 0.0

def mu_asam(x):
    if x <= min_ph - 1.5 or x > min_ph:
        return 0.0
    elif x <= min_ph - 0.5:
        return (x - (min_ph - 1.5)) / 1.0
    else:
        return (min_ph - x) / 0.5

def mu_optimal(x):
    if x <= min_ph - 0.5 or x > max_ph + 0.5:
        return 0.0
    elif x <= min_ph:
        return (x - (min_ph - 0.5)) / 0.5
    elif x <= max_ph:
        return 1.0
    else:
        return (max_ph + 0.5 - x) / 0.5

def mu_basa(x):
    if x <= max_ph or x > max_ph + 1.5:
        return 0.0
    elif x <= max_ph + 0.5:
        return (x - max_ph) / 0.5
    else:
        return (max_ph + 1.5 - x) / 1.0

def mu_sangat_basa(x):
    if x <= max_ph + 0.5:
        return 0.0
    elif x <= max_ph + 1.5:
        return (x - (max_ph + 0.5)) / 1.0
    else:
        return 1.0

# Vectorize functions for numpy arrays
v_mu_sangat_asam = np.vectorize(mu_sangat_asam)
v_mu_asam = np.vectorize(mu_asam)
v_mu_optimal = np.vectorize(mu_optimal)
v_mu_basa = np.vectorize(mu_basa)
v_mu_sangat_basa = np.vectorize(mu_sangat_basa)

# ----------------------------------------------------
# 3. Definisi Fungsi Keanggotaan Kelembapan Berbasis VWC (x2 = theta)
# ----------------------------------------------------
def mu_kering(x):
    if x <= 0.15:
        return 1.0
    elif x <= 0.25:
        return (0.25 - x) / 0.10
    else:
        return 0.0

def mu_sedang(x):
    if x <= 0.15 or x > 0.30:
        return 0.0
    elif x <= 0.25:
        return (x - 0.15) / 0.10
    else:
        return (0.30 - x) / 0.05

def mu_lembap(x):
    if x <= 0.25 or x > 0.40:
        return 0.0
    elif x <= 0.30:
        return (x - 0.25) / 0.05
    elif x <= 0.35:
        return 1.0
    else:
        return (0.40 - x) / 0.05

def mu_jenuh(x):
    if x <= 0.35:
        return 0.0
    elif x <= 0.40:
        return (x - 0.35) / 0.05
    else:
        return 1.0

# Vectorize functions for numpy arrays
v_mu_kering = np.vectorize(mu_kering)
v_mu_sedang = np.vectorize(mu_sedang)
v_mu_lembap = np.vectorize(mu_lembap)
v_mu_jenuh = np.vectorize(mu_jenuh)

# ----------------------------------------------------
# 4. Setup Gaya Tampilan Premium & Plotting
# ----------------------------------------------------
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# Plot 1: pH Membership Functions
fig1, ax1 = plt.subplots(figsize=(10, 6), dpi=300)
x_ph = np.linspace(4.0, 9.0, 1000)

ax1.plot(x_ph, v_mu_sangat_asam(x_ph), label='SANGAT ASAM (SA)', color='#E53935', linewidth=2.5)
ax1.plot(x_ph, v_mu_asam(x_ph), label='ASAM (A)', color='#FB8C00', linewidth=2.5)
ax1.plot(x_ph, v_mu_optimal(x_ph), label='OPTIMAL (Opt)', color='#4CAF50', linewidth=2.5)
ax1.plot(x_ph, v_mu_basa(x_ph), label='BASA (B)', color='#1E88E5', linewidth=2.5)
ax1.plot(x_ph, v_mu_sangat_basa(x_ph), label='SANGAT BASA (SB)', color='#8E24AA', linewidth=2.5)

# Styling Graph 1
ax1.set_title('Fungsi Keanggotaan Variabel Masukan pH Tanah', fontsize=14, fontweight='bold', pad=15, color='#2C3E50')
ax1.set_xlabel('Derajat Keasaman Tanah (pH)', fontsize=11, fontweight='semibold', labelpad=10, color='#34495E')
ax1.set_ylabel('Derajat Keanggotaan ($\mu$)', fontsize=11, fontweight='semibold', labelpad=10, color='#34495E')
ax1.set_xlim(4.0, 9.0)
ax1.set_ylim(-0.05, 1.05)
ax1.set_xticks(np.arange(4.0, 9.1, 0.5))
ax1.set_yticks(np.arange(0.0, 1.1, 0.2))
ax1.grid(True, linestyle='--', alpha=0.6)
ax1.legend(loc='upper right', frameon=True, facecolor='white', edgecolor='#BDC3C7', fontsize=10)

plt.tight_layout()
fig1.savefig('scratch/bab4_membership_ph_bayam.png', bbox_inches='tight')
print("Grafik 'bab4_membership_ph_bayam.png' berhasil dibuat di folder scratch.")

# Plot 2: Moisture Membership Functions
fig2, ax2 = plt.subplots(figsize=(10, 6), dpi=300)
x_moisture = np.linspace(0.0, 0.5, 1000)

ax2.plot(x_moisture, v_mu_kering(x_moisture), label='KERING (Ker)', color='#D84315', linewidth=2.5)
ax2.plot(x_moisture, v_mu_sedang(x_moisture), label='SEDANG (Sed)', color='#FFB300', linewidth=2.5)
ax2.plot(x_moisture, v_mu_lembap(x_moisture), label='LEMBAP (Lem)', color='#00897B', linewidth=2.5)
ax2.plot(x_moisture, v_mu_jenuh(x_moisture), label='JENUH (Jen)', color='#039BE5', linewidth=2.5)

# Styling Graph 2
ax2.set_title('Fungsi Keanggotaan Variabel Masukan Kelembapan Tanah berbasis VWC', fontsize=14, fontweight='bold', pad=15, color='#2C3E50')
ax2.set_xlabel('Kadar Air Volumetrik / Volumetric Water Content (VWC)', fontsize=11, fontweight='semibold', labelpad=10, color='#34495E')
ax2.set_ylabel('Derajat Keanggotaan ($\mu$)', fontsize=11, fontweight='semibold', labelpad=10, color='#34495E')
ax2.set_xlim(0.0, 0.5)
ax2.set_ylim(-0.05, 1.05)
ax2.set_xticks(np.arange(0.0, 0.51, 0.05))
ax2.set_yticks(np.arange(0.0, 1.1, 0.2))
ax2.grid(True, linestyle='--', alpha=0.6)
ax2.legend(loc='upper right', frameon=True, facecolor='white', edgecolor='#BDC3C7', fontsize=10)

plt.tight_layout()
fig2.savefig('scratch/bab4_membership_moisture_vwc.png', bbox_inches='tight')
print("Grafik 'bab4_membership_moisture_vwc.png' berhasil dibuat di folder scratch.")
