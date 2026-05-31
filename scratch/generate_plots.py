import numpy as np
import matplotlib.pyplot as plt

# ----------------------------------------------------
# 1. Definisi Fungsi Keanggotaan pH (x1)
# ----------------------------------------------------
def mu_sangat_asam(x):
    if x <= 4.5:
        return 1.0
    elif x <= 5.5:
        return (5.5 - x) / (5.5 - 4.5)
    else:
        return 0.0

def mu_asam(x):
    if x <= 4.5 or x > 6.5:
        return 0.0
    elif x <= 5.5:
        return (x - 4.5) / (5.5 - 4.5)
    else:
        return (6.5 - x) / (6.5 - 5.5)

def mu_optimal(x):
    if x <= 5.5 or x > 7.5:
        return 0.0
    elif x <= 6.5:
        return (x - 5.5) / (6.5 - 5.5)
    else:
        return (7.5 - x) / (7.5 - 6.5)

def mu_basa(x):
    if x <= 7.0 or x > 8.5:
        return 0.0
    elif x <= 7.5:
        return (x - 7.0) / (7.5 - 7.0)
    else:
        return (8.5 - x) / (8.5 - 7.5)

def mu_sangat_basa(x):
    if x <= 7.5:
        return 0.0
    elif x <= 8.5:
        return (x - 7.5) / (8.5 - 7.5)
    else:
        return 1.0

# Vectorize functions for numpy arrays
v_mu_sangat_asam = np.vectorize(mu_sangat_asam)
v_mu_asam = np.vectorize(mu_asam)
v_mu_optimal = np.vectorize(mu_optimal)
v_mu_basa = np.vectorize(mu_basa)
v_mu_sangat_basa = np.vectorize(mu_sangat_basa)

# ----------------------------------------------------
# 2. Definisi Fungsi Keanggotaan Kelembapan (x2)
# ----------------------------------------------------
def mu_kering(x):
    if x <= 20:
        return 1.0
    elif x <= 30:
        return (30 - x) / (30 - 20)
    else:
        return 0.0

def mu_sedang(x):
    if x <= 25 or x > 60:
        return 0.0
    elif x <= 42.5:
        return (x - 25) / (42.5 - 25)
    else:
        return (60 - x) / (60 - 42.5)

def mu_lembap(x):
    if x <= 55 or x > 85:
        return 0.0
    elif x <= 70:
        return (x - 55) / (70 - 55)
    else:
        return (85 - x) / (85 - 70)

def mu_jenuh(x):
    if x <= 80:
        return 0.0
    elif x <= 90:
        return (x - 80) / (90 - 80)
    else:
        return 1.0

# Vectorize functions for numpy arrays
v_mu_kering = np.vectorize(mu_kering)
v_mu_sedang = np.vectorize(mu_sedang)
v_mu_lembap = np.vectorize(mu_lembap)
v_mu_jenuh = np.vectorize(mu_jenuh)

# ----------------------------------------------------
# 3. Setup Gaya Tampilan Premium & Plotting
# ----------------------------------------------------
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.sans-serif'] = ['DejaVu Sans', 'Arial', 'Helvetica']

# Plot 1: pH Membership Functions
fig1, ax1 = plt.subplots(figsize=(10, 6), dpi=300)
x_ph = np.linspace(4.0, 9.0, 1000)

ax1.plot(x_ph, v_mu_sangat_asam(x_ph), label='SANGAT ASAM', color='#E53935', linewidth=2.5)
ax1.plot(x_ph, v_mu_asam(x_ph), label='ASAM', color='#FB8C00', linewidth=2.5)
ax1.plot(x_ph, v_mu_optimal(x_ph), label='OPTIMAL', color='#4CAF50', linewidth=2.5)
ax1.plot(x_ph, v_mu_basa(x_ph), label='BASA', color='#1E88E5', linewidth=2.5)
ax1.plot(x_ph, v_mu_sangat_basa(x_ph), label='SANGAT BASA', color='#8E24AA', linewidth=2.5)

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
fig1.savefig('scratch/membership_ph.png', bbox_inches='tight')
print("Grafik 'membership_ph.png' berhasil dibuat di folder scratch.")

# Plot 2: Moisture Membership Functions
fig2, ax2 = plt.subplots(figsize=(10, 6), dpi=300)
x_moisture = np.linspace(0.0, 100.0, 1000)

ax2.plot(x_moisture, v_mu_kering(x_moisture), label='KERING', color='#D84315', linewidth=2.5)
ax2.plot(x_moisture, v_mu_sedang(x_moisture), label='SEDANG', color='#FFB300', linewidth=2.5)
ax2.plot(x_moisture, v_mu_lembap(x_moisture), label='LEMBAP', color='#00897B', linewidth=2.5)
ax2.plot(x_moisture, v_mu_jenuh(x_moisture), label='JENUH', color='#039BE5', linewidth=2.5)

# Styling Graph 2
ax2.set_title('Fungsi Keanggotaan Variabel Masukan Kelembapan Tanah', fontsize=14, fontweight='bold', pad=15, color='#2C3E50')
ax2.set_xlabel('Kelembapan Tanah (%)', fontsize=11, fontweight='semibold', labelpad=10, color='#34495E')
ax2.set_ylabel('Derajat Keanggotaan ($\mu$)', fontsize=11, fontweight='semibold', labelpad=10, color='#34495E')
ax2.set_xlim(0.0, 100.0)
ax2.set_ylim(-0.05, 1.05)
ax2.set_xticks(np.arange(0.0, 101.0, 10.0))
ax2.set_yticks(np.arange(0.0, 1.1, 0.2))
ax2.grid(True, linestyle='--', alpha=0.6)
ax2.legend(loc='upper right', frameon=True, facecolor='white', edgecolor='#BDC3C7', fontsize=10)

plt.tight_layout()
fig2.savefig('scratch/membership_moisture.png', bbox_inches='tight')
print("Grafik 'membership_moisture.png' berhasil dibuat di folder scratch.")
