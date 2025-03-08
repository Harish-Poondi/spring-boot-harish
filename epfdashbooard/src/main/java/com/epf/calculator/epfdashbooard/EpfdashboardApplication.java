package com.epf.calculator.epfdashbooard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;

import java.util.LinkedHashMap;
import java.util.Map;

@SpringBootApplication
public class EpfdashboardApplication {
    public static void main(String[] args) {
        SpringApplication.run(EpfdashboardApplication.class, args);
    }
}

@RestController
@RequestMapping("/epf")
class EPFController {

    private static final double EMPLOYEE_PF_RATE = 0.12; // 12%
    private static final double EMPLOYER_PF_RATE = 0.0367; // 3.67%
    private static final int MONTHS_IN_YEAR = 12;

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateEPF(
            @RequestParam double currentBalance,
            @RequestParam double salary,
            @RequestParam double annualIncrease,
            @RequestParam double rateOfInterest,
            @RequestParam int currentAge,
            @RequestParam int retirementAge,
            @RequestParam double voluntaryContribution) {

        int years = retirementAge - currentAge;
        double futureBalance = currentBalance;
        double totalEmployeeContribution = 0;
        double totalEmployerContribution = 0;
        double totalInterest = 0;

        for (int i = 0; i < years; i++) {
            double yearlyEmployeeContribution = salary * EMPLOYEE_PF_RATE * MONTHS_IN_YEAR;
            double yearlyEmployerContribution = salary * EMPLOYER_PF_RATE * MONTHS_IN_YEAR;

            totalEmployeeContribution += yearlyEmployeeContribution;
            totalEmployerContribution += yearlyEmployerContribution;

            futureBalance += yearlyEmployeeContribution + yearlyEmployerContribution + voluntaryContribution;
            double interest = futureBalance * (rateOfInterest / 100);
            totalInterest += interest;
            futureBalance += interest;

            salary += salary * (annualIncrease / 100); // Increment salary for next year
        }

        // Prepare Response
        Map<String, Object> response = new LinkedHashMap<>();
        response.put("futureBalance", Math.round(futureBalance));
        response.put("employeeContribution", Math.round(totalEmployeeContribution));
        response.put("employerContribution", Math.round(totalEmployerContribution));
        response.put("interestEarned", Math.round(totalInterest));
        response.put("voluntaryContribution", Math.round(voluntaryContribution * years));

        return ResponseEntity.ok(response);
    }
}