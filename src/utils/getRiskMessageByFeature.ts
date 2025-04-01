export function getRiskMessage(feature: string, impact: number): string {
    const impactText = ` (impacto: ${impact.toFixed(2)})`;

    const messages: Record<string, string> = {
        Partner: "O status de relacionamento do cliente indica uma propensão elevada ao cancelamento",
        Payment_Delay: "Atrasos recorrentes no pagamento indicam risco elevado de churn",
        Usage_Frequency: "A frequência de uso da plataforma está muito baixa, indicando desengajamento",
        Support_Calls: "O alto número de chamadas de suporte sugere insatisfação com o serviço",
        Days_Since_Last_Interaction: "Faz muito tempo desde a última interação com a plataforma",
        Subscription_Type: "O tipo de assinatura atual está associado a alta rotatividade",
        Tenure: "Clientes com pouco tempo de casa tendem a cancelar mais",
        Age: "O perfil de idade do cliente está associado a maior taxa de churn",
        Gender: "Análises indicam maior churn entre clientes com esse perfil de gênero",
        Total_Spend: "Gastos reduzidos indicam menor engajamento e maior risco de saída",
        Contract_Length: "Clientes com contratos curtos tendem a cancelar com mais frequência",
        Dependents: "O número de dependentes pode influenciar na decisão de cancelamento"
    };

    return messages[feature] ? `${messages[feature]}${impactText}` : `Risco detectado em ${feature}${impactText}`;
}
