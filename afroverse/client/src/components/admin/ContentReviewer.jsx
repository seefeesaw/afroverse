import React, { useState } from 'react';
import { useAdmin } from '../../hooks/useAdmin';
import { 
  Card, 
  Button, 
  Space, 
  Tag, 
  Row, 
  Col, 
  Image, 
  Typography, 
  Divider,
  Modal,
  Input,
  Select,
  message,
  Alert,
  Badge,
  Tooltip
} from 'antd';
import { 
  CheckOutlined, 
  CloseOutlined, 
  ExclamationCircleOutlined,
  EyeOutlined,
  UserOutlined,
  ClockCircleOutlined,
  FlagOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ContentReviewer = ({ job, onUpdate, onClose }) => {
  const {
    makeDecision,
    escalateJob,
    resolveAppeal,
    isLoading
  } = useAdmin();

  const [decision, setDecision] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [escalationReason, setEscalationReason] = useState('');
  const [priority, setPriority] = useState('medium');
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [showDecisionModal, setShowDecisionModal] = useState(false);

  const handleMakeDecision = async () => {
    if (!decision || !reason) {
      message.error('Please provide a decision and reason');
      return;
    }

    try {
      const result = await makeDecision(job._id, decision, reason, notes);
      message.success('Decision made successfully');
      onUpdate(result);
    } catch (error) {
      message.error('Failed to make decision');
    }
  };

  const handleEscalate = async () => {
    if (!escalationReason) {
      message.error('Please provide an escalation reason');
      return;
    }

    try {
      const result = await escalateJob(job._id, escalationReason, priority);
      message.success('Job escalated successfully');
      onUpdate(result);
      setShowEscalationModal(false);
    } catch (error) {
      message.error('Failed to escalate job');
    }
  };

  const handleResolveAppeal = async () => {
    if (!decision || !reason) {
      message.error('Please provide a resolution and reason');
      return;
    }

    try {
      const result = await resolveAppeal(job._id, decision, reason);
      message.success('Appeal resolved successfully');
      onUpdate(result);
    } catch (error) {
      message.error('Failed to resolve appeal');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'orange';
      case 'passed': return 'green';
      case 'blocked': return 'red';
      case 'flagged': return 'purple';
      case 'quarantined': return 'blue';
      case 'needs_review': return 'yellow';
      case 'appealed': return 'cyan';
      case 'resolved': return 'green';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const renderContent = () => {
    if (job.subject.type === 'upload' || job.subject.type === 'transform') {
      return (
        <div>
          <Title level={4}>Image Content</Title>
          <Image
            src={job.subject.contentPreviewUrl}
            alt="Content to review"
            style={{ maxWidth: '100%', maxHeight: '400px' }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN..."
          />
        </div>
      );
    } else if (job.subject.type === 'battle') {
      return (
        <div>
          <Title level={4}>Battle Content</Title>
          <Text>Battle ID: {job.subject.id}</Text>
          <br />
          <Text>User ID: {job.subject.userId}</Text>
        </div>
      );
    } else if (job.subject.type === 'profile') {
      return (
        <div>
          <Title level={4}>Profile Content</Title>
          <Text>Profile ID: {job.subject.id}</Text>
          <br />
          <Text>User ID: {job.subject.userId}</Text>
        </div>
      );
    } else if (job.subject.type === 'comment') {
      return (
        <div>
          <Title level={4}>Comment Content</Title>
          <Text>Comment ID: {job.subject.id}</Text>
          <br />
          <Text>User ID: {job.subject.userId}</Text>
        </div>
      );
    }
    return null;
  };

  const renderAuditTrail = () => {
    if (!job.audit || job.audit.length === 0) {
      return null;
    }

    return (
      <div>
        <Title level={4}>Audit Trail</Title>
        {job.audit.map((entry, index) => (
          <div key={index} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text strong>{entry.change}</Text>
              <Text type="secondary">{new Date(entry.at).toLocaleString()}</Text>
            </div>
            <Text type="secondary">Actor: {entry.actor}</Text>
            {entry.note && (
              <div style={{ marginTop: 8 }}>
                <Text>{entry.note}</Text>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card title="Content Review" style={{ marginBottom: 16 }}>
            {renderContent()}
          </Card>

          <Card title="Job Details" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>Job ID:</Text>
                <br />
                <Text code>{job._id}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Status:</Text>
                <br />
                <Tag color={getStatusColor(job.status)}>
                  {job.status.toUpperCase()}
                </Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Type:</Text>
                <br />
                <Tag color="blue">{job.subject.type}</Tag>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>User ID:</Text>
                <br />
                <Text code>{job.subject.userId}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Created:</Text>
                <br />
                <Text>{new Date(job.createdAt).toLocaleString()}</Text>
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Assigned To:</Text>
                <br />
                <Text>{job.assignedTo?.name || 'Unassigned'}</Text>
              </Col>
            </Row>
          </Card>

          <Card title="AI Analysis Results" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Text strong>NSFW Score:</Text>
                <br />
                <Badge 
                  count={`${(job.scores?.nsfw * 100 || 0).toFixed(1)}%`} 
                  style={{ backgroundColor: job.scores?.nsfw > 0.5 ? '#f5222d' : '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Violence Score:</Text>
                <br />
                <Badge 
                  count={`${(job.scores?.violence * 100 || 0).toFixed(1)}%`} 
                  style={{ backgroundColor: job.scores?.violence > 0.5 ? '#f5222d' : '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Hate Score:</Text>
                <br />
                <Badge 
                  count={`${(job.scores?.hate * 100 || 0).toFixed(1)}%`} 
                  style={{ backgroundColor: job.scores?.hate > 0.5 ? '#f5222d' : '#52c41a' }}
                />
              </Col>
              <Col xs={24} sm={12}>
                <Text strong>Anomaly Score:</Text>
                <br />
                <Badge 
                  count={`${(job.scores?.anomaly * 100 || 0).toFixed(1)}%`} 
                  style={{ backgroundColor: job.scores?.anomaly > 0.5 ? '#f5222d' : '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>

          <Card title="Labels" style={{ marginBottom: 16 }}>
            <div>
              {job.labels?.map((label, index) => (
                <Tag key={index} color="purple" style={{ marginBottom: 8 }}>
                  {label}
                </Tag>
              ))}
            </div>
          </Card>

          {renderAuditTrail()}
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Actions" style={{ marginBottom: 16 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {job.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    block
                    onClick={() => setShowDecisionModal(true)}
                  >
                    Approve
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseOutlined />}
                    block
                    onClick={() => setShowDecisionModal(true)}
                  >
                    Reject
                  </Button>
                  <Button
                    type="default"
                    icon={<ExclamationCircleOutlined />}
                    block
                    onClick={() => setShowEscalationModal(true)}
                  >
                    Escalate
                  </Button>
                </>
              )}

              {job.status === 'appealed' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    block
                    onClick={() => setShowDecisionModal(true)}
                  >
                    Overturn
                  </Button>
                  <Button
                    type="primary"
                    danger
                    icon={<CloseOutlined />}
                    block
                    onClick={() => setShowDecisionModal(true)}
                  >
                    Uphold
                  </Button>
                </>
              )}

              <Button
                type="default"
                block
                onClick={onClose}
              >
                Close
              </Button>
            </Space>
          </Card>

          <Card title="Quick Info" style={{ marginBottom: 16 }}>
            <div>
              <Text strong>Priority:</Text>
              <br />
              <Tag color={getPriorityColor(job.escalation?.priority)}>
                {job.escalation?.priority?.toUpperCase() || 'NORMAL'}
              </Tag>
            </div>
            <Divider />
            <div>
              <Text strong>Report Count:</Text>
              <br />
              <Badge count={job.reportCount || 0} />
            </div>
            <Divider />
            <div>
              <Text strong>Last Updated:</Text>
              <br />
              <Text>{new Date(job.updatedAt).toLocaleString()}</Text>
            </div>
          </Card>
        </Col>
      </Row>

      <Modal
        title="Make Decision"
        open={showDecisionModal}
        onCancel={() => setShowDecisionModal(false)}
        onOk={job.status === 'appealed' ? handleResolveAppeal : handleMakeDecision}
        confirmLoading={isLoading}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Decision:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={decision}
            onChange={setDecision}
            placeholder="Select decision"
          >
            {job.status === 'appealed' ? (
              <>
                <Option value="overturned">Overturn</Option>
                <Option value="upheld">Uphold</Option>
              </>
            ) : (
              <>
                <Option value="allow">Allow</Option>
                <Option value="block">Block</Option>
                <Option value="blur">Blur</Option>
                <Option value="age_gate">Age Gate</Option>
                <Option value="hold_publish">Hold Publish</Option>
                <Option value="escalate">Escalate</Option>
                <Option value="warn">Warn</Option>
                <Option value="mute">Mute</Option>
              </>
            )}
          </Select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <Text strong>Reason:</Text>
          <TextArea
            style={{ marginTop: 8 }}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter reason for decision"
            rows={3}
          />
        </div>
        <div>
          <Text strong>Notes (Optional):</Text>
          <TextArea
            style={{ marginTop: 8 }}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Additional notes"
            rows={2}
          />
        </div>
      </Modal>

      <Modal
        title="Escalate Job"
        open={showEscalationModal}
        onCancel={() => setShowEscalationModal(false)}
        onOk={handleEscalate}
        confirmLoading={isLoading}
      >
        <div style={{ marginBottom: 16 }}>
          <Text strong>Priority:</Text>
          <Select
            style={{ width: '100%', marginTop: 8 }}
            value={priority}
            onChange={setPriority}
          >
            <Option value="high">High</Option>
            <Option value="medium">Medium</Option>
            <Option value="low">Low</Option>
          </Select>
        </div>
        <div>
          <Text strong>Escalation Reason:</Text>
          <TextArea
            style={{ marginTop: 8 }}
            value={escalationReason}
            onChange={(e) => setEscalationReason(e.target.value)}
            placeholder="Enter reason for escalation"
            rows={4}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ContentReviewer;
