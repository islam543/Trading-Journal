import { useState } from 'react';
import type { AppSettings, RiskFormat } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import './Settings.css';

const defaultSettings: Omit<AppSettings, 'themeIntensity'> = {
    defaultRiskFormat: 'percentage',
    enabledTradeFields: {
        commission: true,
        rrRatio: true,
        confluences: true,
        imageUrl: true
    },
    confluenceLabels: [
        'Trend Following',
        'Support/Resistance',
        'Volume Analysis',
        'RSI Divergence',
        'Breakout',
        'Reversal Pattern',
        'Multiple Timeframe',
        'Fundamental Analysis'
    ]
};

const Settings = () => {
    const { themeIntensity, setThemeIntensity } = useTheme();
    const [settings, setSettings] = useState<Omit<AppSettings, 'themeIntensity'>>(defaultSettings);
    const [newLabel, setNewLabel] = useState('');

    const handleThemeChange = (intensity: any) => {
        setThemeIntensity(intensity);
    };

    const handleRiskFormatChange = (format: RiskFormat) => {
        setSettings({ ...settings, defaultRiskFormat: format });
    };

    const handleFieldToggle = (field: keyof AppSettings['enabledTradeFields']) => {
        setSettings({
            ...settings,
            enabledTradeFields: {
                ...settings.enabledTradeFields,
                [field]: !settings.enabledTradeFields[field]
            }
        });
    };

    const handleAddLabel = () => {
        if (newLabel.trim() && !settings.confluenceLabels.includes(newLabel.trim())) {
            setSettings({
                ...settings,
                confluenceLabels: [...settings.confluenceLabels, newLabel.trim()]
            });
            setNewLabel('');
        }
    };

    const handleRemoveLabel = (label: string) => {
        setSettings({
            ...settings,
            confluenceLabels: settings.confluenceLabels.filter(l => l !== label)
        });
    };

    const handleSave = () => {
        // In a real app, save to localStorage or backend
        console.log('Settings saved:', settings);
        alert('Settings saved successfully!');
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset all settings to default?')) {
            setSettings(defaultSettings);
        }
    };

    return (
        <div className="settings-page">
            <div className="settings-header">
                <div>
                    <h1 className="settings-title">Settings</h1>
                    <p className="settings-subtitle">Customize your trading journal experience</p>
                </div>
                <div className="settings-actions">
                    <button className="btn-secondary" onClick={handleReset}>
                        Reset to Default
                    </button>
                    <button className="btn-primary" onClick={handleSave}>
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="settings-content">
                {/* Theme Section */}
                <section className="settings-section glass">
                    <div className="section-header">
                        <div className="section-icon">🎨</div>
                        <div>
                            <h2 className="section-title">Theme Preferences</h2>
                            <p className="section-description">Adjust the visual intensity of the interface</p>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">Accent Intensity</label>
                        <div className="intensity-options">
                            <button
                                className={`intensity-btn ${themeIntensity === 'low' ? 'active' : ''}`}
                                onClick={() => handleThemeChange('low')}
                            >
                                <div className="intensity-preview low"></div>
                                <span>Low</span>
                            </button>
                            <button
                                className={`intensity-btn ${themeIntensity === 'medium' ? 'active' : ''}`}
                                onClick={() => handleThemeChange('medium')}
                            >
                                <div className="intensity-preview medium"></div>
                                <span>Medium</span>
                            </button>
                            <button
                                className={`intensity-btn ${themeIntensity === 'high' ? 'active' : ''}`}
                                onClick={() => handleThemeChange('high')}
                            >
                                <div className="intensity-preview high"></div>
                                <span>High</span>
                            </button>
                        </div>
                    </div>
                </section>

                {/* Trade Configuration Section */}
                <section className="settings-section glass">
                    <div className="section-header">
                        <div className="section-icon">⚙️</div>
                        <div>
                            <h2 className="section-title">Trade Configuration</h2>
                            <p className="section-description">Configure default trade entry settings</p>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">Default Risk Format</label>
                        <div className="radio-group">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="riskFormat"
                                    checked={settings.defaultRiskFormat === 'percentage'}
                                    onChange={() => handleRiskFormatChange('percentage')}
                                />
                                <span className="radio-custom"></span>
                                <div className="radio-content">
                                    <span className="radio-title">Percentage (%)</span>
                                    <span className="radio-description">Risk as % of account</span>
                                </div>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="riskFormat"
                                    checked={settings.defaultRiskFormat === 'fixed'}
                                    onChange={() => handleRiskFormatChange('fixed')}
                                />
                                <span className="radio-custom"></span>
                                <div className="radio-content">
                                    <span className="radio-title">Fixed Amount ($)</span>
                                    <span className="radio-description">Risk as dollar value</span>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div className="setting-item">
                        <label className="setting-label">Enabled Trade Fields</label>
                        <div className="toggle-group">
                            <label className="toggle-label">
                                <div className="toggle-content">
                                    <span className="toggle-title">Commission</span>
                                    <span className="toggle-description">Track trading fees</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledTradeFields.commission}
                                        onChange={() => handleFieldToggle('commission')}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                            <label className="toggle-label">
                                <div className="toggle-content">
                                    <span className="toggle-title">Risk/Reward Ratio</span>
                                    <span className="toggle-description">Display RR ratio</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledTradeFields.rrRatio}
                                        onChange={() => handleFieldToggle('rrRatio')}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                            <label className="toggle-label">
                                <div className="toggle-content">
                                    <span className="toggle-title">Confluences</span>
                                    <span className="toggle-description">Tag trade setups</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledTradeFields.confluences}
                                        onChange={() => handleFieldToggle('confluences')}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                            <label className="toggle-label">
                                <div className="toggle-content">
                                    <span className="toggle-title">Chart Screenshot</span>
                                    <span className="toggle-description">Attach chart images</span>
                                </div>
                                <div className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        checked={settings.enabledTradeFields.imageUrl}
                                        onChange={() => handleFieldToggle('imageUrl')}
                                    />
                                    <span className="toggle-slider"></span>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Confluence Labels Section */}
                <section className="settings-section glass">
                    <div className="section-header">
                        <div className="section-icon">🏷️</div>
                        <div>
                            <h2 className="section-title">Confluence Labels</h2>
                            <p className="section-description">Manage your custom confluence tags</p>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="label-input-group">
                            <input
                                type="text"
                                className="label-input glass"
                                placeholder="Add new label..."
                                value={newLabel}
                                onChange={(e) => setNewLabel(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                            />
                            <button className="btn-add" onClick={handleAddLabel}>
                                Add Label
                            </button>
                        </div>

                        <div className="labels-list">
                            {settings.confluenceLabels.map(label => (
                                <div key={label} className="label-item">
                                    <span>{label}</span>
                                    <button
                                        className="label-remove"
                                        onClick={() => handleRemoveLabel(label)}
                                        title="Remove label"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Data Preferences Section */}
                <section className="settings-section glass">
                    <div className="section-header">
                        <div className="section-icon">💾</div>
                        <div>
                            <h2 className="section-title">Data Preferences</h2>
                            <p className="section-description">Manage your trading data</p>
                        </div>
                    </div>

                    <div className="setting-item">
                        <div className="data-actions">
                            <button className="data-btn">
                                <span className="data-icon">📤</span>
                                <div className="data-btn-content">
                                    <span className="data-btn-title">Export Data</span>
                                    <span className="data-btn-description">Download your trades as CSV</span>
                                </div>
                            </button>
                            <button className="data-btn">
                                <span className="data-icon">📥</span>
                                <div className="data-btn-content">
                                    <span className="data-btn-title">Import Data</span>
                                    <span className="data-btn-description">Upload trades from CSV</span>
                                </div>
                            </button>
                            <button className="data-btn danger">
                                <span className="data-icon">🗑️</span>
                                <div className="data-btn-content">
                                    <span className="data-btn-title">Clear All Data</span>
                                    <span className="data-btn-description">Permanently delete all trades</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Settings;
