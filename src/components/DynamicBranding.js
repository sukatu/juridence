import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';

const DynamicBranding = ({ tenant }) => {
  const { theme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (tenant) {
      applyTenantBranding(tenant, theme);
      setIsLoaded(true);
    }
  }, [tenant, theme]);

  const applyTenantBranding = (tenantData, currentTheme) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties for tenant branding
    if (tenantData.primary_color) {
      root.style.setProperty('--tenant-primary', tenantData.primary_color);
      root.style.setProperty('--tenant-primary-50', `${tenantData.primary_color}0D`);
      root.style.setProperty('--tenant-primary-100', `${tenantData.primary_color}1A`);
      root.style.setProperty('--tenant-primary-500', tenantData.primary_color);
      root.style.setProperty('--tenant-primary-600', darkenColor(tenantData.primary_color, 0.1));
      root.style.setProperty('--tenant-primary-700', darkenColor(tenantData.primary_color, 0.2));
    }
    
    if (tenantData.secondary_color) {
      root.style.setProperty('--tenant-secondary', tenantData.secondary_color);
      root.style.setProperty('--tenant-secondary-50', `${tenantData.secondary_color}0D`);
      root.style.setProperty('--tenant-secondary-100', `${tenantData.secondary_color}1A`);
      root.style.setProperty('--tenant-secondary-500', tenantData.secondary_color);
      root.style.setProperty('--tenant-secondary-600', darkenColor(tenantData.secondary_color, 0.1));
      root.style.setProperty('--tenant-secondary-700', darkenColor(tenantData.secondary_color, 0.2));
    }
    
    if (tenantData.accent_color) {
      root.style.setProperty('--tenant-accent', tenantData.accent_color);
      root.style.setProperty('--tenant-accent-50', `${tenantData.accent_color}0D`);
      root.style.setProperty('--tenant-accent-100', `${tenantData.accent_color}1A`);
      root.style.setProperty('--tenant-accent-500', tenantData.accent_color);
      root.style.setProperty('--tenant-accent-600', darkenColor(tenantData.accent_color, 0.1));
      root.style.setProperty('--tenant-accent-700', darkenColor(tenantData.accent_color, 0.2));
    }
    
    if (tenantData.font_family) {
      root.style.setProperty('--tenant-font-family', tenantData.font_family);
    }

    // Update favicon
    if (tenantData.favicon_url) {
      updateFavicon(tenantData.favicon_url);
    }

    // Update page title and meta description
    if (tenantData.app_name) {
      document.title = tenantData.app_name;
    }
    
    if (tenantData.app_tagline) {
      updateMetaDescription(tenantData.app_tagline);
    }

    // Update theme color for mobile browsers
    updateThemeColor(tenantData.primary_color, currentTheme);
  };

  const darkenColor = (hex, amount) => {
    // Simple color darkening function
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * amount * 100);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const updateFavicon = (faviconUrl) => {
    // Remove existing favicon
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const link = document.createElement('link');
    link.rel = 'icon';
    link.href = faviconUrl;
    document.head.appendChild(link);
  };

  const updateMetaDescription = (description) => {
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.name = 'description';
      document.head.appendChild(metaDescription);
    }
    metaDescription.content = description;
  };

  const updateThemeColor = (primaryColor, currentTheme) => {
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Use primary color for light theme, darker version for dark theme
    const themeColor = currentTheme === 'dark' 
      ? darkenColor(primaryColor || '#3B82F6', 0.3)
      : primaryColor || '#3B82F6';
    
    metaThemeColor.content = themeColor;
  };

  // Apply custom CSS for tenant-specific styling
  useEffect(() => {
    if (isLoaded && tenant) {
      const styleId = 'tenant-branding-styles';
      let existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }

      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        /* Tenant-specific CSS variables */
        :root {
          --tenant-primary: ${tenant.primary_color || '#3B82F6'};
          --tenant-secondary: ${tenant.secondary_color || '#1E40AF'};
          --tenant-accent: ${tenant.accent_color || '#F59E0B'};
          --tenant-font-family: ${tenant.font_family || 'Inter'};
        }

        /* Apply tenant font family */
        body {
          font-family: var(--tenant-font-family), system-ui, -apple-system, sans-serif;
        }

        /* Tenant-specific button styles */
        .btn-primary {
          background-color: var(--tenant-primary);
          border-color: var(--tenant-primary);
        }
        
        .btn-primary:hover {
          background-color: var(--tenant-primary-700);
          border-color: var(--tenant-primary-700);
        }

        /* Tenant-specific link styles */
        .link-primary {
          color: var(--tenant-primary);
        }
        
        .link-primary:hover {
          color: var(--tenant-primary-700);
        }

        /* Tenant-specific accent elements */
        .accent-primary {
          color: var(--tenant-primary);
        }
        
        .accent-secondary {
          color: var(--tenant-secondary);
        }
        
        .accent-accent {
          color: var(--tenant-accent);
        }

        /* Tenant-specific background colors */
        .bg-tenant-primary {
          background-color: var(--tenant-primary);
        }
        
        .bg-tenant-primary-50 {
          background-color: var(--tenant-primary-50);
        }
        
        .bg-tenant-primary-100 {
          background-color: var(--tenant-primary-100);
        }

        /* Tenant-specific border colors */
        .border-tenant-primary {
          border-color: var(--tenant-primary);
        }

        /* Tenant-specific text colors */
        .text-tenant-primary {
          color: var(--tenant-primary);
        }
        
        .text-tenant-secondary {
          color: var(--tenant-secondary);
        }
        
        .text-tenant-accent {
          color: var(--tenant-accent);
        }

        /* Dark mode tenant colors */
        .dark .bg-tenant-primary {
          background-color: var(--tenant-primary-700);
        }
        
        .dark .text-tenant-primary {
          color: var(--tenant-primary-400);
        }
      `;
      
      document.head.appendChild(style);
    }
  }, [isLoaded, tenant]);

  // This component doesn't render anything visible
  return null;
};

export default DynamicBranding;
