<?php

use App\Http\Controllers\Api\V1\Admin\AdminNotificationController;
use App\Http\Controllers\Api\V1\Admin\AdminUserController;
use App\Http\Controllers\Api\V1\Admin\AnonymousQuestionController;
use App\Http\Controllers\Api\V1\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\ContentAuditController as AdminContentAuditController;
use App\Http\Controllers\Api\V1\Admin\ContentController as AdminContentController;
use App\Http\Controllers\Api\V1\Admin\ContentRevisionController as AdminContentRevisionController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\EditorialActionController;
use App\Http\Controllers\Api\V1\Admin\LifeStageController;
use App\Http\Controllers\Api\V1\Admin\ReminderController;
use App\Http\Controllers\Api\V1\Admin\RolePermissionController;
use App\Http\Controllers\Api\V1\Admin\SupportContactController;
use App\Http\Controllers\Api\V1\Admin\TaxonomyController;
use App\Http\Controllers\Api\V1\Mobile\AuthController as MobileAuthController;
use App\Http\Controllers\Api\V1\Mobile\CatalogController as MobileCatalogController;
use App\Http\Controllers\Api\V1\Mobile\ContentController as MobileContentController;
use App\Http\Controllers\Api\V1\Mobile\EmailVerificationController as MobileEmailVerificationController;
use App\Http\Controllers\Api\V1\Mobile\LegalDocumentController as MobileLegalDocumentController;
use App\Http\Controllers\Api\V1\Mobile\MenstrualCycleController as MobileMenstrualCycleController;
use App\Http\Controllers\Api\V1\Mobile\ProfileController as MobileProfileController;
use App\Http\Controllers\Api\V1\Mobile\SymptomRecordController as MobileSymptomRecordController;
/** @noinspection PhpUndefinedClassInspection */
use Illuminate\Support\Facades\Route;

Route::prefix('v1/admin')->name('api.v1.admin.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::post('login', [AdminAuthController::class, 'login'])->name('login');

        Route::middleware(['auth:sanctum', 'admin.role'])->group(function (): void {
            Route::get('me', [AdminAuthController::class, 'me'])->name('me');
            Route::post('logout', [AdminAuthController::class, 'logout'])->name('logout');
        });
    });

    Route::middleware(['auth:sanctum', 'admin.role'])->group(function (): void {
        Route::get('dashboard', [AdminDashboardController::class, 'show'])->name('dashboard');
        Route::get('admin-users', [AdminUserController::class, 'index'])->name('admin-users.index');
        Route::post('admin-users', [AdminUserController::class, 'store'])->name('admin-users.store');
        Route::patch('admin-users/{adminUser}', [AdminUserController::class, 'update'])->name('admin-users.update');
        Route::get('app-users', [AppUserController::class, 'index'])->name('app-users.index');
        Route::patch('app-users/{appUser}', [AppUserController::class, 'update'])->name('app-users.update');
        Route::get('roles', [RolePermissionController::class, 'roles'])->name('roles.index');
        Route::get('permissions', [RolePermissionController::class, 'permissions'])->name('permissions.index');
        Route::get('taxonomies', [TaxonomyController::class, 'index'])->name('taxonomies.index');
        Route::get('categories', [TaxonomyController::class, 'categories'])->name('categories.index');
        Route::post('categories', [TaxonomyController::class, 'storeCategory'])->name('categories.store');
        Route::patch('categories/{category}', [TaxonomyController::class, 'updateCategory'])->name('categories.update');
        Route::delete('categories/{category}', [TaxonomyController::class, 'destroyCategory'])->name('categories.destroy');
        Route::get('life-stages', [LifeStageController::class, 'index'])->name('life-stages.index');
        Route::patch('life-stages/{lifeStage}', [LifeStageController::class, 'update'])->name('life-stages.update');
        Route::get('age-ranges', [TaxonomyController::class, 'ageRanges'])->name('age-ranges.index');
        Route::get('contents', [AdminContentController::class, 'index'])->name('contents.index');
        Route::post('contents', [AdminContentController::class, 'store'])->name('contents.store');
        Route::get('contents/{content}', [AdminContentController::class, 'show'])->name('contents.show');
        Route::patch('contents/{content}', [AdminContentController::class, 'update'])->name('contents.update');
        Route::post('contents/{content}/submit-review', [EditorialActionController::class, 'submitReview'])->name('contents.submit-review');
        Route::post('contents/{content}/request-adjustments', [EditorialActionController::class, 'requestAdjustments'])->name('contents.request-adjustments');
        Route::post('contents/{content}/approve', [EditorialActionController::class, 'approve'])->name('contents.approve');
        Route::post('contents/{content}/publish', [EditorialActionController::class, 'publish'])->middleware('admin.role:admin')->name('contents.publish');
        Route::post('contents/{content}/archive', [EditorialActionController::class, 'archive'])->middleware('admin.role:admin')->name('contents.archive');
        Route::get('contents/{content}/audit', [AdminContentAuditController::class, 'index'])->name('contents.audit');
        Route::get('contents/{content}/revisions', [AdminContentRevisionController::class, 'index'])->name('contents.revisions');
        Route::get('anonymous-questions', [AnonymousQuestionController::class, 'index'])->name('anonymous-questions.index');
        Route::get('anonymous-questions/{anonymousQuestion}', [AnonymousQuestionController::class, 'show'])->name('anonymous-questions.show');
        Route::post('anonymous-questions/{anonymousQuestion}/answer', [AnonymousQuestionController::class, 'answer'])->name('anonymous-questions.answer');
        Route::post('anonymous-questions/{anonymousQuestion}/archive', [AnonymousQuestionController::class, 'archive'])->name('anonymous-questions.archive');
        Route::get('notifications', [AdminNotificationController::class, 'index'])->name('notifications.index');
        Route::post('notifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
        Route::get('reminders', [ReminderController::class, 'index'])->name('reminders.index');
        Route::post('reminders', [ReminderController::class, 'store'])->name('reminders.store');
        Route::patch('reminders/{reminder}', [ReminderController::class, 'update'])->name('reminders.update');
        Route::post('reminders/{reminder}/duplicate', [ReminderController::class, 'duplicate'])->name('reminders.duplicate');
        Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy'])->name('reminders.destroy');
        Route::get('support-contacts', [SupportContactController::class, 'index'])->name('support-contacts.index');
        Route::post('support-contacts', [SupportContactController::class, 'store'])->name('support-contacts.store');
        Route::patch('support-contacts/{supportContact}', [SupportContactController::class, 'update'])->name('support-contacts.update');
        Route::delete('support-contacts/{supportContact}', [SupportContactController::class, 'destroy'])->name('support-contacts.destroy');
    });
});

Route::prefix('v1/mobile')->name('api.v1.mobile.')->group(function (): void {
    Route::prefix('auth')->name('auth.')->group(function (): void {
        Route::post('register', [MobileAuthController::class, 'register'])->name('register');
        Route::post('login', [MobileAuthController::class, 'login'])->name('login');
        Route::post('email/verify', [MobileEmailVerificationController::class, 'verify'])->name('email.verify');
        Route::post('email/resend', [MobileEmailVerificationController::class, 'resend'])->name('email.resend');
    });

    Route::get('categories', [MobileCatalogController::class, 'categories'])->name('categories.index');
    Route::get('symptoms', [MobileCatalogController::class, 'symptoms'])->name('symptoms.index');
    Route::get('contents', [MobileContentController::class, 'index'])->name('contents.index');
    Route::get('contents/{slug}', [MobileContentController::class, 'show'])->name('contents.show');
    Route::get('legal-documents/current', [MobileLegalDocumentController::class, 'current'])->name('legal-documents.current');

    Route::middleware(['auth:sanctum'])->group(function (): void {
        Route::get('me', [MobileProfileController::class, 'show'])->name('me.show');
        Route::patch('me', [MobileProfileController::class, 'update'])->name('me.update');
        Route::post('legal-acceptances', [MobileLegalDocumentController::class, 'accept'])->name('legal-acceptances.store');

        Route::middleware(['ability:mobile:full'])->group(function (): void {
            Route::get('cycles', [MobileMenstrualCycleController::class, 'index'])->name('cycles.index');
            Route::post('cycles', [MobileMenstrualCycleController::class, 'store'])->name('cycles.store');
            Route::get('symptom-records', [MobileSymptomRecordController::class, 'index'])->name('symptom-records.index');
            Route::post('symptom-records', [MobileSymptomRecordController::class, 'store'])->name('symptom-records.store');
        });
    });
});
