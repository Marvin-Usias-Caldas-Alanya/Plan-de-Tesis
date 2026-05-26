import { useState } from 'react';
import ChatbotRuleForm from './ChatbotRuleForm';
import ChatbotRulesTable from './ChatbotRulesTable';

export default function ChatbotRulesPanel({
  rules,
  loading,
  submitting,
  onSaveRule,
  onRemoveRule,
  onToggleActive,
}) {
  const [editingRule, setEditingRule] = useState(null);

  const handleSubmit = async (form) => {
    const ok = await onSaveRule(form, editingRule?.id);
    if (ok) setEditingRule(null);
  };

  return (
    <>
      <ChatbotRuleForm
        editingRule={editingRule}
        submitting={submitting}
        onSubmit={handleSubmit}
        onCancel={() => setEditingRule(null)}
      />
      <ChatbotRulesTable
        rules={rules}
        loading={loading}
        onEdit={setEditingRule}
        onDelete={onRemoveRule}
        onToggleActive={onToggleActive}
      />
    </>
  );
}
