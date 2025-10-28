import React, { useEffect, useState } from 'react';
import { useAdmin } from '../hooks/useAdmin';
import { 
  DashboardOutlined, 
  ModerationOutlined, 
  SecurityScanOutlined, 
  UserOutlined, 
  TeamOutlined, 
  AuditOutlined,
  BellOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Layout, Menu, Card, Row, Colistic, Alert, Spin, Button, Avatar, Dropdown } from 'antd';
import ModerationQueue from './ModerationQueue';
import ContentReviewer from './ContentReviewer';
import FraudCenter from './FraudCenter';
import UserManagement from './UserManagement';
import TribeManagement from './TribeManagement';
import AuditLog from './AuditLog';

const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  const {
    isAuthenticated,
    isLoading,
    error,
    admin,
    dashboard,
    activeTab,
    getDashboardData,
    setActiveTabAction,
    clearErrorAction,
    logout
  } = useAdmin();

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !dashboard) {
      getDashboardData();
    }
  }, [isAuthenticated, dashboard, getDashboardData]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearErrorAction();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearErrorAction]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: 'moderation',
      icon: <ModerationOutlined />,
      label: 'Moderation',
    },
    {
      key: 'fraud',
      icon: <SecurityScanOutlined />,
      label: 'Fraud Center',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'User Management',
    },
    {
      key: 'tribes',
      icon: <TeamOutlined />,
      label: 'Tribe Management',
    },
    {
      key: 'audit',
      icon: <AuditOutlined />,
      label: 'Audit Logs',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Pending Moderation"
                    value={dashboard?.moderation?.pending || 0}
                    valueStyle={{ color: '#f5222d' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Fraud Detections"
                    value={dashboard?.fraud?.pending || 0}
                    valueStyle={{ color: '#fa8c16' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Active Users"
                    value={dashboard?.users?.active || 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12} md={6}>
                <Card>
                  <Statistic
                    title="Total Tribes"
                    value={dashboard?.tribes?.total || 0}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} md={12}>
                <Card title="Recent Moderation Activity" size="small">
                  <div style={{ height: 200, overflow: 'auto' }}>
                    {dashboard?.moderation?.recent?.map((activity, index) => (
                      <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ fontWeight: 'bold' }}>{activity.action}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{activity.timestamp}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="System Health" size="small">
                  <div style={{ height: 200, overflow: 'auto' }}>
                    {dashboard?.system?.health?.map((status, index) => (
                      <div key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                        <div style={{ fontWeight: 'bold' }}>{status.component}</div>
                        <div style={{ fontSize: '12px', color: status.status === 'healthy' ? '#52c41a' : '#f5222d' }}>
                          {status.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        );
      case 'moderation':
        return <ModerationQueue />;
      case 'fraud':
        return <FraudCenter />;
      case 'users':
        return <UserManagement />;
      case 'tribes':
        return <TribeManagement />;
      case 'audit':
        return <AuditLog />;
      default:
        return <div>Select a menu item</div>;
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <h2>Admin Access Required</h2>
        <p>Please log in to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        theme="dark"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #303030'
        }}>
          <h3 style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'A' : 'Afroverse Admin'}
          </h3>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[activeTab]}
          items={menuItems}
          onClick={({ key }) => setActiveTabAction(key)}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          background: '#fff', 
          padding: '0 24px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <h2 style={{ margin: 0 }}>Admin Dashboard</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <BellOutlined style={{ fontSize: 18, cursor: 'pointer' }} />
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <Avatar size="small" style={{ marginRight: 8 }}>
                  {admin?.name?.charAt(0) || 'A'}
                </Avatar>
                <span>{admin?.name || 'Admin'}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content style={{ padding: 24, background: '#f5f5f5' }}>
          {error && (
            <Alert
              message="Error"
              description={error}
              type="error"
              closable
              onClose={clearErrorAction}
              style={{ marginBottom: 16 }}
            />
          )}
          
          {isLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              height: '50vh' 
            }}>
              <Spin size="large" />
            </div>
          ) : (
            renderContent()
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
